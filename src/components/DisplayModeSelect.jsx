import { useState } from 'react'
import { useAppearance } from '../contexts/appearanceContext.js'
import { displayModes } from '../services/appearance.js'
import shared from './PhysicalBook.module.css'

export default function DisplayModeSelect() {
  const { preferences, update } = useAppearance()
  const [error, setError] = useState('')

  return <div>
    <label>Modo de exibição
      <select value={preferences.mode} onChange={(event) => {
        try {
          update({ mode: event.target.value })
          setError('')
        } catch {
          setError('Não foi possível salvar o modo de exibição.')
        }
      }}>
        {Object.entries(displayModes).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
    {error && <p role="alert" className={shared.error}>{error}</p>}
  </div>
}
