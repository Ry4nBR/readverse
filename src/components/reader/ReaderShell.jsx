import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Reader.module.css'

export default function ReaderShell({ book, children }) {
  const shell = useRef(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    function sync() { setFullscreen(document.fullscreenElement === shell.current) }
    function escape(event) { if (event.key === 'Escape') setExpanded(false) }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  async function toggle() {
    if (expanded) setExpanded(false)
    else if (fullscreen) await document.exitFullscreen()
    else {
      try {
        if (!shell.current.requestFullscreen) throw new Error('Tela cheia indisponível.')
        await shell.current.requestFullscreen()
      } catch {
        setExpanded(true)
      }
    }
  }

  return <main ref={shell} className={styles.shell} data-expanded={expanded}>
    <header className={styles.header}>
      <Link to={'/biblioteca-digital/' + book.id}>Voltar ao livro</Link>
      <h1>{book.title}</h1>
      <button type="button" aria-pressed={fullscreen || expanded} onClick={() => void toggle()}>
        {fullscreen || expanded ? 'Sair da tela cheia' : 'Tela cheia'}
      </button>
    </header>
    {children}
  </main>
}
