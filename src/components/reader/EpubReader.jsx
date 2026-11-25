import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'
import { epubLocation, flattenToc } from '../../utils/epubNavigation.js'
import { getReaderPreferences, saveReaderPreferences } from '../../services/readerPreferences.js'
import { applyEpubStyles } from '../../utils/epubStyles.js'
import ReaderSettings from './ReaderSettings.jsx'
import ReaderNavigation from './ReaderNavigation.jsx'
import styles from './Reader.module.css'

function limitContent(contents) {
  const policy = contents.createElement('meta')
  policy.httpEquiv = 'Content-Security-Policy'
  policy.content = "default-src 'none'; img-src blob: data:; style-src 'unsafe-inline' blob: data:; font-src blob: data:; media-src blob: data:"
  contents.head.prepend(policy)
}

export default function EpubReader({ file, book, onPosition }) {
  const [preferences, setPreferences] = useState(getReaderPreferences)
  const [settingsError, setSettingsError] = useState('')
  const currentPreferences = useRef(preferences)
  const viewport = useRef(null)
  const rendition = useRef(null)
  const [location, setLocation] = useState(null)
  const [toc, setToc] = useState([])
  const [navigationError, setNavigationError] = useState(false)
  const initialCfi = book.readerPosition?.format === 'epub' ? book.readerPosition.cfi : undefined
  const [state, setState] = useState('loading')

  useEffect(() => {
    let active = true
    let publication
    let renderer
    async function open() {
      try {
        const bytes = await file.arrayBuffer()
        if (!active) return
        publication = ePub(undefined, { replacements: 'blobUrl' })
        await publication.open(bytes)
        await publication.opened
        if (!active) return
        publication.spine.hooks.content.register(limitContent)
        renderer = publication.renderTo(viewport.current, {
          width: '100%', height: '100%', flow: 'paginated', spread: 'none', allowScriptedContent: false,
        })
        rendition.current = renderer
        renderer.hooks.content.register((contents) => applyEpubStyles(contents, currentPreferences.current))
        renderer.on('displayError', () => {
          if (active) {
            setNavigationError(true)
            setState((previous) => previous === 'loading' ? 'error' : previous)
          }
        })
        renderer.on('relocated', (current) => {
          if (active) setLocation(epubLocation(publication, current))
        })
        void publication.loaded.navigation.then((navigation) => {
          if (active) setToc(flattenToc(navigation.toc))
        }, () => {})
        const target = initialCfi && publication.spine.get(initialCfi) ? initialCfi : undefined
        await renderer.display(target)
        if (active) setState('ready')
      } catch {
        if (active) setState('error')
      }
    }
    void open()
    return () => {
      active = false
      rendition.current = null
      renderer?.destroy()
      publication?.destroy()
    }
  }, [file, initialCfi])

  useEffect(() => {
    if (state === 'ready' && location) onPosition(location.cfi, location.percentage)
  }, [location, onPosition, state])

  function updatePreferences(changes) {
    const next = { ...preferences, ...changes }
    currentPreferences.current = next
    setPreferences(next)
    try {
      saveReaderPreferences(next)
      setSettingsError('')
    } catch {
      setSettingsError('Não foi possível guardar as configurações neste navegador.')
    }
    const current = rendition.current
    if (current) {
      current.getContents().forEach((contents) => applyEpubStyles(contents, next))
      if (location?.cfi) void current.display(location.cfi).catch(() => setNavigationError(true))
    }
  }

  function navigate(action, target) {
    setNavigationError(false)
    const current = rendition.current
    if (current) void current[action](target).catch(() => setNavigationError(true))
  }

  return <>
    {state === 'loading' && <p role="status">Carregando EPUB…</p>}
    {state === 'error' && <p role="alert" className={styles.error}>Não foi possível abrir este EPUB.</p>}
    {navigationError && <p role="alert" className={styles.error}>Não foi possível exibir essa parte do EPUB.</p>}
    {state === 'ready' && <ReaderSettings preferences={preferences} onChange={updatePreferences} error={settingsError} />}
    {state === 'ready' && <div className={styles.toolbar}>
      {toc.length > 0 && <label>Sumário
        <select value={toc.find(({ href }) => href.split('#')[0] === location?.href)?.href ?? ''}
          onChange={(event) => navigate('display', event.target.value)}>
          <option value="" disabled>Ir para um capítulo</option>
          {toc.map(({ href, label, depth }, index) =>
            <option key={index} value={href}>{'– '.repeat(depth)}{label}</option>,
          )}
        </select>
      </label>}
      <div className={styles.controls} aria-label="Navegação por capítulos">
        <button type="button" disabled={!location?.previousChapter}
          onClick={() => navigate('display', location.previousChapter)}>Capítulo anterior</button>
        <button type="button" disabled={!location?.nextChapter}
          onClick={() => navigate('display', location.nextChapter)}>Próximo capítulo</button>
      </div>
    </div>}
    <div className={styles.epub} aria-label="Conteúdo do EPUB" ref={viewport} />
    {state === 'ready' && <ReaderNavigation label={location ? 'Página ' + location.page + ' de ' + location.pages + ' no capítulo' : 'Calculando página…'}
      previous={() => navigate('prev')} next={() => navigate('next')}
      disablePrevious={!location || location.first} disableNext={!location || location.last} />}
  </>
}
