import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DuplicateBookError } from '../services/physicalBooks.js'
import { emptyBook, readingStatuses, validateBookForm } from '../utils/bookForm.js'
import BookCover from './BookCover.jsx'
import IsbnLookup from './IsbnLookup.jsx'
import styles from './PhysicalBook.module.css'

const fields = [
  { name: 'title', label: 'Título', required: true },
  { name: 'author', label: 'Autor', required: true },
  { name: 'publisher', label: 'Editora' },
  { name: 'isbn', label: 'ISBN' },
  { name: 'year', label: 'Ano de publicação', inputMode: 'numeric', maxLength: 4 },
  { name: 'genre', label: 'Gênero' },
]
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const coverSizeLimit = 5 * 1024 * 1024

export default function PhysicalBookForm({ initialBook = emptyBook, onSave, allowLookup = false, cancelTo = '/biblioteca' }) {
  const [book, setBook] = useState(initialBook)
  const [error, setError] = useState('')
  const [coverError, setCoverError] = useState('')
  const [checkingCover, setCheckingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)
  const busy = saving || checkingCover || searching

  function applyLookup(result) {
    setBook((current) => ({ ...current, ...result, coverUrl: current.coverBlob ? '' : result.coverUrl }))
    setError('')
  }

  function update(event) {
    const { name, value } = event.target
    setBook((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function uploadCover(event) {
    const input = event.currentTarget
    const file = input.files[0]
    input.value = ''
    if (!file) return
    setCoverError('')
    if (!imageTypes.includes(file.type) || file.size > coverSizeLimit) {
      setCoverError('Escolha uma imagem JPEG, PNG, WebP ou GIF de até 5 MB.')
      return
    }
    setCheckingCover(true)
    try {
      const bitmap = await createImageBitmap(file)
      bitmap.close()
      setBook((current) => ({ ...current, coverBlob: file, coverUrl: '' }))
    } catch {
      setCoverError('O arquivo selecionado não pôde ser aberto como imagem.')
    } finally {
      setCheckingCover(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const message = validateBookForm(book)
    if (message) {
      setError(message)
      return
    }
    setSaving(true)
    setError('')
    const normalized = Object.fromEntries(Object.entries(book).map(([name, value]) =>
      [name, typeof value === 'string' ? value.trim() : value],
    ))
    try {
      await onSave(normalized)
    } catch (failure) {
      setError(failure instanceof DuplicateBookError ? failure.message :
        'Não foi possível salvar o livro neste navegador. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.panel} onSubmit={submit}>
      {allowLookup && <IsbnLookup disabled={busy} onResult={applyLookup} onLoadingChange={setSearching} />}
      <fieldset disabled={busy} className={styles.form}>
        <legend>Dados do livro</legend>
        <div className={styles.fields}>
          {fields.map(({ name, label, ...attributes }) => (
            <label key={name}>
              {label}{attributes.required && ' *'}
              <input name={name} value={book[name]} onChange={update} {...attributes} />
            </label>
          ))}
          <label>
            Status de leitura
            <select name="status" value={book.status} onChange={update}>
              {Object.entries(readingStatuses).map(([value, label]) =>
                <option key={value} value={value}>{label}</option>,
              )}
            </select>
          </label>
          <label className={styles.fullWidth}>
            Descrição
            <textarea name="description" value={book.description} onChange={update} rows={4} />
          </label>
        </div>
        <div className={styles.coverField}>
          <BookCover coverBlob={book.coverBlob} coverUrl={book.coverUrl} />
          <div>
            <label>
              Capa personalizada
              <input type="file" accept={imageTypes.join(',')} onChange={uploadCover} />
            </label>
            {(book.coverBlob || book.coverUrl) && (
              <button type="button" className={styles.secondary} onClick={() => {
                setCoverError('')
                setBook((current) => ({ ...current, coverBlob: null, coverUrl: '' }))
              }}>Remover capa</button>
            )}
          </div>
        </div>
        {coverError && <p role="alert" className={styles.error}>{coverError}</p>}
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button className={styles.primary} disabled={busy}>
          {saving ? 'Salvando…' : checkingCover ? 'Verificando imagem…' : 'Salvar livro'}
        </button>
        <Link to={cancelTo}>Cancelar</Link>
      </div>
    </form>
  )
}
