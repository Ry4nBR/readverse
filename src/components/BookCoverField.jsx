import { useState } from 'react'
import BookCover from './BookCover.jsx'
import styles from './PhysicalBook.module.css'

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const coverSizeLimit = 5 * 1024 * 1024

export default function BookCoverField({ coverBlob, coverUrl, onChange, onBusyChange }) {
  const [error, setError] = useState('')

  async function upload(event) {
    const input = event.currentTarget
    const file = input.files[0]
    input.value = ''
    if (!file) return
    setError('')
    if (!imageTypes.includes(file.type) || file.size > coverSizeLimit) {
      setError('Escolha uma imagem JPEG, PNG, WebP ou GIF de até 5 MB.')
      return
    }

    onBusyChange(true)
    try {
      const bitmap = await createImageBitmap(file)
      bitmap.close()
      onChange(file)
    } catch {
      setError('O arquivo selecionado não pôde ser aberto como imagem.')
    } finally {
      onBusyChange(false)
    }
  }

  return (
    <>
      <div className={styles.coverField}>
        <BookCover coverBlob={coverBlob} coverUrl={coverUrl} />
        <div>
          <label>
            Capa personalizada
            <input type="file" accept={imageTypes.join(',')} onChange={upload} />
          </label>
          {(coverBlob || coverUrl) && (
            <button type="button" className={styles.secondary} onClick={() => {
              setError('')
              onChange(null)
            }}>Remover capa</button>
          )}
        </div>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </>
  )
}
