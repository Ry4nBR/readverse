import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReaderProgress from '../components/reader/ReaderProgress.jsx'
import { useReaderActivity } from '../hooks/useReaderActivity.js'
import ReaderShell from '../components/reader/ReaderShell.jsx'
import styles from '../components/reader/Reader.module.css'
import { openReaderFile } from '../services/readerFile.js'

const PdfReader = lazy(() => import('../components/reader/PdfReader.jsx'))
const EpubReader = lazy(() => import('../components/reader/EpubReader.jsx'))

function OpenReader({ book, file, format }) {
  const activity = useReaderActivity(book, format)
  const Reader = format === 'pdf' ? PdfReader : EpubReader
  return <ReaderShell book={book}>
    <Suspense fallback={<p role="status">Preparando leitor…</p>}>
      <Reader file={file} book={book} onPosition={activity.onPosition} />
    </Suspense>
    <ReaderProgress {...activity} />
  </ReaderShell>
}

function ReaderSession({ id }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    openReaderFile(id).then((data) => { if (active) setResult(data) }, (error) => {
      if (active) setResult({ error: error.message })
    })
    return () => { active = false }
  }, [id])

  if (!result || result.error) return <main className={styles.shell}>
    <Link to={'/biblioteca-digital/' + id}>Voltar ao livro</Link>
    {result ? <p role="alert" className={styles.error}>{result.error}</p> : <p role="status">Buscando arquivo…</p>}
  </main>

  return <OpenReader {...result} />
}

export default function DigitalReaderPage() {
  const { bookId } = useParams()
  return <ReaderSession key={bookId} id={bookId} />
}
