import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDigitalBook } from '../services/digitalBooks.js'
import shared from './PhysicalBook.module.css'

export default function DigitalBookRecord({ id, children }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    getDigitalBook(id).then((book) => {
      if (active) setResult({ id, book })
    }, (error) => {
      if (active) setResult({ id, error: error.message })
    })
    return () => { active = false }
  }, [id])

  if (result?.id === id && result?.book) return children(result.book)

  return (
    <section className={shared.page}>
      <Link to="/biblioteca-digital">Voltar para a estante digital</Link>
      {!result || result.id !== id ? <p role="status">Carregando livro digital…</p> :
        result.error ? <p className={shared.error} role="alert">{result.error}</p> :
          <h1>Livro digital não encontrado</h1>}
    </section>
  )
}
