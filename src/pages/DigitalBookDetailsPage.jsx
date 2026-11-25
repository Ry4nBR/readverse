import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BookCover from '../components/BookCover.jsx'
import DigitalBookRecord from '../components/DigitalBookRecord.jsx'
import shared from '../components/PhysicalBook.module.css'
import { getDigitalFile } from '../services/digitalBooks.js'
import { readingStatuses } from '../utils/bookForm.js'

const dateFormat = new Intl.DateTimeFormat('pt-BR')
const sizeFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

function BookDetails({ book }) {
  const { state } = useLocation()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const size = book.size < 1024 ? book.size + ' bytes' : book.size < 1024 ** 2 ?
    sizeFormat.format(book.size / 1024) + ' KB' : sizeFormat.format(book.size / 1024 ** 2) + ' MB'
  const rows = [
    ['Arquivo', book.fileName], ['Formato', book.format.toUpperCase()], ['Tamanho', size],
    ['Importado em', dateFormat.format(book.importedAt)], ['Gênero', book.genre],
    ['Status de leitura', readingStatuses[book.status]],
  ].filter(([, value]) => value)

  async function download() {
    setDownloading(true)
    setError('')
    try {
      const file = await getDigitalFile(book.id)
      if (!file) throw new Error('O arquivo original não está disponível neste navegador.')
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = book.fileName
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className={shared.page}>
      <Link to="/biblioteca-digital">Voltar para a estante digital</Link>
      {state?.notice && <p role="status">{state.notice}</p>}
      <article className={shared.panel}>
        <div className={shared.detailsHeader}>
          <BookCover coverBlob={book.coverBlob} />
          <div><h1>{book.title}</h1><p>{book.author}</p></div>
        </div>
        <dl className={shared.metadata}>
          {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {book.description && <section>
          <h2>Descrição</h2>
          <p className={shared.description}>{book.description}</p>
        </section>}
        {error && <p className={shared.error} role="alert">{error}</p>}
        <div className={shared.actions}>
          <Link className={shared.secondary} to="editar">Editar livro</Link>
          <button type="button" className={shared.primary} disabled={downloading} onClick={download}>
            {downloading ? 'Buscando arquivo…' : 'Baixar original'}
          </button>
        </div>
      </article>
    </section>
  )
}

export default function DigitalBookDetailsPage() {
  const { bookId } = useParams()
  return <DigitalBookRecord id={bookId}>{(book) => <BookDetails key={book.id} book={book} />}</DigitalBookRecord>
}
