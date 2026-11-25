import DisplayModeSelect from '../components/DisplayModeSelect.jsx'
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
          <DisplayModeSelect />
          <label>Cor de destaque
            <input type="color" value={preferences.accent ?? { light: '#365341', dark: '#a5d5ac', sepia: '#784631' }[preferences.theme]}
              onChange={(event) => apply({ accent: event.target.value })} />
          </label>
          <label>Densidade das capas
            <select value={preferences.density} onChange={(event) => apply({ density: event.target.value })}>
              <option value="comfortable">Confortável</option>
              <option value="compact">Compacta</option>
            </select>
          </label>
          <label className={shared.checkbox}>
            <input type="checkbox" checked={preferences.showAuthors}
              onChange={(event) => apply({ showAuthors: event.target.checked })} />
            Mostrar autores nas estantes
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
