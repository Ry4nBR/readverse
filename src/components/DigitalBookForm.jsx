import { useState } from 'react'
import BookCoverField from './BookCoverField.jsx'
import { readingStatuses } from '../utils/bookForm.js'
import styles from './PhysicalBook.module.css'

const fields = [
  { name: 'title', label: 'Título', required: true, maxLength: 300 },
  { name: 'author', label: 'Autor', required: true, maxLength: 300 },
  { name: 'genre', label: 'Gênero', maxLength: 120 },
]

export default function DigitalBookForm({ initialBook, onSave, onCancel, cancelLabel = 'Cancelar' }) {
  const [book, setBook] = useState(() => ({
    title: initialBook.title ?? '',
    author: initialBook.author ?? '',
    genre: initialBook.genre ?? '',
    description: initialBook.description ?? '',
    status: initialBook.status ?? 'toRead',
    coverBlob: initialBook.coverBlob ?? null,
  }))
  const [error, setError] = useState('')
  const [checkingCover, setCheckingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const busy = saving || checkingCover

  function update({ target: { name, value } }) {
    setBook((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const metadata = Object.fromEntries(Object.entries(book).map(([key, value]) =>
      [key, typeof value === 'string' ? value.trim() : value],
    ))
    if (!metadata.title || !metadata.author) {
      setError('Informe o título e o autor para salvar o livro.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave(metadata)
    } catch (failure) {
      setError(failure.message || 'Não foi possível salvar o livro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.panel} onSubmit={submit}>
      <fieldset disabled={busy} className={styles.form}>
        <legend>Dados do livro</legend>
        <div className={styles.fields}>
          {fields.map(({ name, label, ...options }) => (
            <label key={name}>
              {label}{options.required && ' *'}
              <input name={name} value={book[name]} onChange={update} {...options} />
            </label>
          ))}
          <label>
            Status de leitura
            <select name="status" value={book.status} onChange={update}>
              {Object.entries(readingStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className={styles.fullWidth}>
            Descrição
            <textarea name="description" value={book.description} onChange={update} rows={4} maxLength={10000} />
          </label>
        </div>
        <BookCoverField coverBlob={book.coverBlob} onBusyChange={setCheckingCover}
          onChange={(coverBlob) => setBook((current) => ({ ...current, coverBlob }))} />
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={busy}>
          {saving ? 'Salvando…' : checkingCover ? 'Verificando imagem…' : 'Salvar livro'}
        </button>
        <button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>{cancelLabel}</button>
      </div>
    </form>
  )
}
