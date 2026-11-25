import { useState } from 'react'
import { getReadingGoal, saveReadingGoal } from '../services/readingGoals.js'
import { annualProgress } from '../utils/readingStats.js'
import shared from './PhysicalBook.module.css'
import styles from './AnnualReadingGoal.module.css'

function load(year) {
  try {
    return { value: getReadingGoal(year), error: '' }
  } catch {
    return { value: null, error: 'Não foi possível acessar a meta neste navegador.' }
  }
}

export default function AnnualReadingGoal({ finished, year }) {
  const [goal, setGoal] = useState(() => load(year))
  const [draft, setDraft] = useState(goal.value ?? '')
  const [notice, setNotice] = useState('')
  const progress = annualProgress(finished, year, goal.value)

  function submit(event) {
    event.preventDefault()
    setNotice('')
    try {
      setGoal({ value: saveReadingGoal(year, Number(draft)), error: '' })
      setNotice('Meta anual salva.')
    } catch (error) {
      setGoal((current) => ({
        ...current, error: error instanceof RangeError ? error.message : 'Não foi possível salvar a meta neste navegador.',
      }))
    }
  }

  return (
    <section className={shared.panel}>
      <h2>Meta de leitura {year}</h2>
      <form className={styles.goalForm} onSubmit={submit}>
        <label>Livros na meta anual
          <input type="number" min={1} max={9999} step={1} required value={draft}
            onChange={(event) => { setDraft(event.target.value); setNotice('') }} />
        </label>
        <button type="submit" className={shared.primary}>Salvar meta</button>
      </form>
      {goal.error && <p role="alert" className={shared.error}>{goal.error}</p>}
      {notice && <p role="status">{notice}</p>}
      <dl className={shared.metadata}>
        <div><dt>Meta definida</dt><dd>{goal.value ?? 'Ainda não definida'}</dd></div>
        <div><dt>Concluídos no ano</dt><dd>{progress.completed}</dd></div>
        <div><dt>Progresso da meta</dt><dd>{goal.value === null ? '—' : progress.percentage + '%'}</dd></div>
        <div><dt>Livros restantes</dt><dd>{progress.remaining ?? '—'}</dd></div>
      </dl>
      {goal.value !== null && <progress className={styles.progress} aria-label="Progresso anual" max={goal.value}
        value={Math.min(progress.completed, goal.value)} />}
    </section>
  )
}
