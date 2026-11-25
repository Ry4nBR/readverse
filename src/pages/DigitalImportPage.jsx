import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DigitalBookForm from '../components/DigitalBookForm.jsx'
import DigitalDropZone from '../components/DigitalDropZone.jsx'
import styles from '../components/DigitalLibrary.module.css'
import shared from '../components/PhysicalBook.module.css'
import { saveDigitalBook } from '../services/digitalBooks.js'
import { prepareDigitalFile } from '../services/digitalImport.js'

export default function DigitalImportPage() {
  const active = useRef(false)
  const [drafts, setDrafts] = useState([])
  const [progress, setProgress] = useState(null)
  const [errors, setErrors] = useState([])
  const [notice, setNotice] = useState('')

  async function queueFiles(files) {
    if (!files.length || active.current) return
    active.current = true
    setErrors([])
    setNotice('')
    const hashes = new Set(drafts.map((draft) => draft.hash))
    try {
      for (const [index, file] of files.entries()) {
        const update = (phase) => setProgress({ fileName: file.name, index, total: files.length, phase })
        update('Validando formato e tamanho…')
        try {
          const draft = await prepareDigitalFile(file, { pendingHashes: hashes, onPhase: update })
          hashes.add(draft.hash)
          setDrafts((current) => [...current, draft])
        } catch (failure) {
          setErrors((current) => [...current, { key: index, name: file.name, text: failure.message }])
        }
      }
    } finally {
      active.current = false
      setProgress(null)
    }
  }

  function discard(hash) {
    setDrafts((current) => current.filter((draft) => draft.hash !== hash))
  }

  async function save(draft, metadata) {
    await saveDigitalBook(draft, metadata)
    discard(draft.hash)
    setNotice('“' + metadata.title + '” foi adicionado à estante digital.')
  }

  return (
    <section className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>Importar livros digitais</h1>
        <Link to="/biblioteca-digital">Ir para a estante digital</Link>
      </header>
      <DigitalDropZone onFiles={queueFiles} busy={Boolean(progress)} />
      {progress && (
        <div className={shared.panel}>
          <p role="status">Arquivo {progress.index + 1} de {progress.total} · {progress.fileName}<br />{progress.phase}</p>
          <progress className={styles.progress} aria-label="Arquivos analisados" value={progress.index} max={progress.total} />
        </div>
      )}
      {errors.length > 0 && (
        <div className={shared.panel} role="alert">
          <p>Alguns arquivos não puderam ser preparados.</p>
          <ul className={styles.importErrors}>
            {errors.map(({ key, name, text }) => <li key={key}><strong>{name}</strong> — {text}</li>)}
          </ul>
        </div>
      )}
      {notice && <p className={shared.panel} role="status">{notice}</p>}
      {drafts.map((draft) => (
        <section key={draft.hash} className={styles.draft}>
          <h2>{draft.file.name}</h2>
          <p>{draft.metadata.title && draft.metadata.author ? 'Revise os dados antes de salvar.' :
            'Preencha o título e o autor que não foram identificados no arquivo.'}</p>
          <DigitalBookForm initialBook={draft.metadata} onSave={(metadata) => save(draft, metadata)}
            cancelLabel="Descartar arquivo" onCancel={() => discard(draft.hash)} />
        </section>
      ))}
    </section>
  )
}
