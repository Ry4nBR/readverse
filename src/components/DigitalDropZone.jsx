import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { digitalFileAccept } from '../services/digitalFile.js'
import styles from './DigitalLibrary.module.css'
import shared from './PhysicalBook.module.css'

export default function DigitalDropZone({ onFiles, busy }) {
  const input = useRef(null)
  const [dragging, setDragging] = useState(false)

  return (
    <section className={styles.dropZone} data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = busy ? 'none' : 'copy'
        if (!busy) setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (!busy) void onFiles([...event.dataTransfer.files])
      }}>
      <Upload size={30} aria-hidden="true" />
      <h2>Arraste seus arquivos aqui</h2>
      <p>PDF, EPUB ou MOBI · até 100 MB por arquivo</p>
      <input ref={input} hidden type="file" accept={digitalFileAccept} multiple
        disabled={busy} aria-label="Arquivos de livros digitais"
        onChange={(event) => {
          const files = [...event.currentTarget.files]
          event.currentTarget.value = ''
          void onFiles(files)
        }} />
      <button type="button" className={shared.primary} disabled={busy}
        onClick={() => input.current.click()}>Selecionar arquivos</button>
    </section>
  )
}
