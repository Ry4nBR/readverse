import { useState } from 'react'
import { updateBookReading } from '../services/bookReading.js'
import { readingOf, readingStatuses } from '../utils/reading.js'
import styles from './ReadingStatusSelect.module.css'

export default function ReadingStatusSelect({ book }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function update(status) {
    setSaving(true)
    setError('')
    try {
      await updateBookReading(book.kind, book.id, { status })
    } catch {
      setError('Não foi possível atualizar o status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.status}>
      <label>
        Status de leitura
        <select aria-label={'Status de leitura de ' + book.title} value={readingOf(book).status} disabled={saving}
          onChange={(event) => void update(event.target.value)}>
          {Object.entries(readingStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      {saving && <span role="status">Salvando…</span>}
    </div>
  )
}
