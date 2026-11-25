import { useState } from 'react'
import shared from './PhysicalBook.module.css'

const initialFields = { name: '', description: '', color: '#365341' }

export default function ShelfForm({ shelf, onSave, onCancel, busy }) {
  const [data, setData] = useState(shelf ?? initialFields)

  function update({ target: { name, value } }) {
    setData((current) => ({ ...current, [name]: value }))
  }

  return (
    <form className={shared.panel} onSubmit={(event) => {
      event.preventDefault()
      void onSave(data)
    }}>
      <h2>{shelf ? 'Editar estante' : 'Nova estante'}</h2>
      <fieldset className={shared.form} disabled={busy}>
        <div className={shared.fields}>
          <label>Nome da estante<input name="name" maxLength={80} required value={data.name} onChange={update} /></label>
          <label>Cor da estante<input name="color" type="color" value={data.color} onChange={update} /></label>
          <label className={shared.fullWidth}>Descrição da estante
            <textarea name="description" rows={3} maxLength={400} value={data.description} onChange={update} />
          </label>
        </div>
        <div className={shared.actions}>
          <button className={shared.primary} type="submit">{busy ? 'Salvando…' : 'Salvar estante'}</button>
          <button className={shared.secondary} type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </fieldset>
    </form>
  )
}
