import { useState } from 'react'
import { toggleEpubBookmark } from '../../services/digitalBooks.js'
import styles from './Reader.module.css'

export default function EpubBookmarks({ book, current, chapter, goTo }) {
  const [bookmarks, setBookmarks] = useState(book.readerBookmarks ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const marked = bookmarks.some((item) => item.cfi === current)

  async function toggle(cfi, label) {
    setSaving(true)
    setError('')
    try {
      const updated = await toggleEpubBookmark(book.id, cfi, label)
      setBookmarks(updated.readerBookmarks)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  return <details className={styles.settings}>
    <summary>Marcadores favoritos ({bookmarks.length})</summary>
    <button type="button" aria-pressed={marked} disabled={!current || saving}
      onClick={() => void toggle(current, chapter)}>
      {marked ? 'Remover marcador atual' : 'Marcar esta posição'}
    </button>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {bookmarks.length > 0 && <ul className={styles.bookmarks}>
      {bookmarks.map((item) => <li key={item.cfi} className={styles.controls}>
        <button type="button" onClick={() => goTo(item.cfi)}>{item.label}</button>
        <button type="button" disabled={saving} aria-label={'Remover marcador de ' + item.label}
          onClick={() => void toggle(item.cfi, item.label)}>Remover</button>
      </li>)}
    </ul>}
  </details>
}
