import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'
import styles from './Reader.module.css'

function limitContent(contents) {
  const policy = contents.createElement('meta')
  policy.httpEquiv = 'Content-Security-Policy'
  policy.content = "default-src 'none'; img-src blob: data:; style-src 'unsafe-inline' blob: data:; font-src blob: data:; media-src blob: data:"
  contents.head.prepend(policy)
}

export default function EpubReader({ file }) {
  const viewport = useRef(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let active = true
    let publication
    let renderer
    async function open() {
      try {
        const bytes = await file.arrayBuffer()
        if (!active) return
        publication = ePub(bytes, { replacements: 'blobUrl' })
        await publication.opened
        if (!active) return
        publication.spine.hooks.content.register(limitContent)
        renderer = publication.renderTo(viewport.current, {
          width: '100%', height: '100%', flow: 'paginated', spread: 'none', allowScriptedContent: false,
        })
        renderer.on('displayError', () => { if (active) setState('error') })
        await renderer.display()
        if (active) setState('ready')
      } catch {
        if (active) setState('error')
      }
    }
    void open()
    return () => {
      active = false
      renderer?.destroy()
      publication?.destroy()
    }
  }, [file])

  return <>
    {state === 'loading' && <p role="status">Carregando EPUB…</p>}
    {state === 'error' && <p role="alert" className={styles.error}>Não foi possível abrir este EPUB.</p>}
    <div className={styles.epub} aria-label="Conteúdo do EPUB" ref={viewport} />
  </>
}
