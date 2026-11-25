import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import ReaderNavigation from './ReaderNavigation.jsx'
import styles from './Reader.module.css'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker
const pdfOptions = { isEvalSupported: false }

export default function PdfReader({ file, book, onPosition }) {
  const viewport = useRef(null)
  const [width, setWidth] = useState(0)
  const [document, setDocument] = useState(null)
  const [error, setError] = useState('')
  const [rendering, setRendering] = useState(false)
  const page = document?.page
  const pages = document?.pages

  useEffect(() => {
    const element = viewport.current
    const observer = new ResizeObserver(() => setWidth(Math.max(1, Math.min(1050, element.clientWidth - 16))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function navigate(next) {
    setError('')
    setRendering(true)
    setDocument({ pages, page: next })
    viewport.current.scrollTo({ top: 0, left: 0 })
  }

  return <>
    {document && <ReaderNavigation label={'Página ' + page + ' de ' + pages}
      previous={() => navigate(page - 1)} next={() => navigate(page + 1)}
      disablePrevious={page <= 1} disableNext={page >= pages} />}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.pdf} ref={viewport} aria-label="Conteúdo do PDF">
      <Document file={file} options={pdfOptions} loading={<p role="status">Carregando PDF…</p>}
        error={<p>O PDF não pôde ser aberto.</p>}
        onSourceError={() => setError('Não foi possível ler o arquivo PDF.')}
        onLoadError={() => setError('O PDF é inválido ou não pôde ser carregado.')}
        onPassword={() => setError('Este PDF precisa de uma senha e não pode ser aberto aqui.')}
        onLoadSuccess={({ numPages }) => {
          const saved = book.readerPosition?.format === 'pdf' ? book.readerPosition.page : 1
          setError('')
          setDocument({ pages: numPages, page: Math.max(1, Math.min(numPages, saved || 1)) })
          setRendering(true)
        }}>
        {document && width > 0 && <Page pageNumber={page} width={width}
          renderAnnotationLayer={false} loading={<p role="status">Renderizando página…</p>}
          onLoadError={() => { setRendering(false); setError('Não foi possível carregar esta página do PDF.') }}
          onRenderError={() => { setRendering(false); setError('Não foi possível renderizar esta página do PDF.') }}
          onRenderSuccess={() => { setRendering(false); onPosition(page, page / pages * 100) }} />}
      </Document>
      {rendering && <p className={styles.rendering} role="status">Preparando página…</p>}
    </div>
  </>
}
