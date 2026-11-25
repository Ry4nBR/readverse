import { useState } from 'react'
import { updateBookReading } from '../services/bookReading.js'
import { localDate, ReadingError, readingOf, readingStatuses } from '../utils/reading.js'
import shared from './PhysicalBook.module.css'
import styles from './BookReadingForm.module.css'

export default function BookReadingForm({ book, kind }) {
  const initial = readingOf(book)
  const [draft, setDraft] = useState(initial)
  const [progress, setProgress] = useState(initial.progress)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const today = localDate()

  function update({ target: { name, value } }) {
    setError('')
    setNotice('')
    setDraft((previous) => {
      if (name !== 'status') return { ...previous, [name]: value }
      const startDate = value === 'toRead' ? '' : previous.startDate || (value === 'reading' ? today : '')
      return {
        ...previous, status: value, startDate,
        completedDate: value === 'finished' ? previous.completedDate || today : '',
        progress: value === 'finished' ? 100 : value === 'toRead' || previous.status === 'finished' ? 0 : previous.progress,
      }
    })
  }

  async function save(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await updateBookReading(kind, book.id, {
        ...draft, progress: draft.status === 'reading' && draft.progress === '' ? NaN : Number(draft.progress),
        rating: draft.rating ? Number(draft.rating) : null,
      })
      const next = readingOf(result)
      setDraft(next)
      setProgress(next.progress)
      setNotice('Acompanhamento atualizado.')
    } catch (failure) {
      setError(failure instanceof ReadingError ? failure.message : 'Não foi possível salvar o acompanhamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={shared.panel} onSubmit={save}>
      <h2>Acompanhamento de leitura</h2>
      <div className={styles.progress}>
        <span>Progresso salvo</span><strong>{progress}%</strong>
        <progress max={100} value={progress} aria-label="Progresso salvo" />
      </div>
      <fieldset className={shared.form} disabled={saving}>
        <div className={shared.fields}>
          <label>Status de leitura
            <select name="status" value={draft.status} onChange={update}>
              {Object.entries(readingStatuses).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
            </select>
          </label>
          <label>Progresso (%)
            <input name="progress" type="number" min={0} max={100} step={1} required value={draft.progress}
              disabled={draft.status !== 'reading'} onChange={update} />
          </label>
          <label>Data de início
            <input name="startDate" type="date" max={today} value={draft.startDate}
              disabled={draft.status === 'toRead'} onChange={update} />
          </label>
          <label>Data de conclusão
            <input name="completedDate" type="date" min={draft.startDate || undefined} max={today} value={draft.completedDate}
              disabled={draft.status !== 'finished'} onChange={update} />
          </label>
          <label>Avaliação pessoal
            <select name="rating" value={draft.rating ?? ''} onChange={update}>
              <option value="">Sem avaliação</option>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} de 5</option>)}
            </select>
          </label>
          <label className={shared.fullWidth}>Observações
            <textarea name="notes" rows={4} maxLength={5000} value={draft.notes} onChange={update} />
          </label>
        </div>
        <div><button type="submit" className={shared.primary}>{saving ? 'Salvando…' : 'Salvar acompanhamento'}</button></div>
      </fieldset>
      {error && <p role="alert" className={shared.error}>{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </form>
  )
}
