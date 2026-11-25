import { useState } from 'react'
import { useAppearance } from '../contexts/appearanceContext.js'
import { themes } from '../services/appearance.js'
import shared from '../components/PhysicalBook.module.css'

export default function AppearancePage() {
  const { preferences, update } = useAppearance()
  const [error, setError] = useState('')

  function apply(changes) {
    try {
      update(changes)
      setError('')
    } catch {
      setError('Não foi possível salvar a preferência neste navegador.')
    }
  }

  return (
    <section className={shared.page}>
      <h1>Aparência</h1>
      <div className={shared.panel}>
        <div className={shared.fields}>
          <label>Tema
            <select value={preferences.theme} onChange={(event) => apply({ theme: event.target.value })}>
              {Object.entries(themes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Cor de destaque
            <input type="color" value={preferences.accent ?? { light: '#365341', dark: '#a5d5ac', sepia: '#784631' }[preferences.theme]}
              onChange={(event) => apply({ accent: event.target.value })} />
          </label>
        </div>
        {preferences.accent && <div>
          <button type="button" className={shared.secondary} onClick={() => apply({ accent: null })}>
            Usar cor padrão do tema
          </button>
        </div>}
        {error && <p role="alert" className={shared.error}>{error}</p>}
      </div>
    </section>
  )
}
