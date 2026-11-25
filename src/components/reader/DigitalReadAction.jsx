import { useState } from 'react'
import { Link } from 'react-router-dom'
import { attachMobiEpub, canReadDigitalBook } from '../../services/readerFile.js'
import shared from '../PhysicalBook.module.css'

export default function DigitalReadAction({ book }) {
  const [linked, setLinked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function attach(event) {
    const input = event.currentTarget
    const file = input.files[0]
    input.value = ''
    if (!file) return
    setSaving(true)
    setError('')
    try {
      await attachMobiEpub(book.id, file)
      setLinked(true)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  if (linked || canReadDigitalBook(book)) return <Link className={shared.primary} to="ler">Ler agora</Link>

  return <div className={shared.panel}>
    <p>Converta o MOBI para EPUB no Calibre e vincule a cópia aqui. O MOBI original continua disponível para download.</p>
    <label>Vincular EPUB convertido
      <input type="file" accept=".epub,application/epub+zip" disabled={saving} onChange={attach} />
    </label>
    {saving && <p role="status">Validando e guardando EPUB…</p>}
    {error && <p role="alert" className={shared.error}>{error}</p>}
  </div>
}
