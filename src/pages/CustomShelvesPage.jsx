import { useEffect, useState } from 'react'
import DisplayModeSelect from '../components/DisplayModeSelect.jsx'
import DeleteBookDialog from '../components/DeleteBookDialog.jsx'
import ShelfContents from '../components/ShelfContents.jsx'
import ShelfOrganizer from '../components/ShelfOrganizer.jsx'
import ShelfForm from '../components/ShelfForm.jsx'
import shared from '../components/PhysicalBook.module.css'
import styles from './CustomShelvesPage.module.css'
import { createShelf, deleteShelf, listShelves, moveShelfBook, reorderShelf, ShelfError, updateShelf } from '../services/customShelves.js'
import { listShelfBooks } from '../services/shelfCatalog.js'

export default function CustomShelvesPage() {
  const [shelves, setShelves] = useState(null)
  const [books, setBooks] = useState(null)
  const [bookError, setBookError] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    listShelves().then((data) => { if (active) setShelves(data) }, () => {
      if (active) setError('Não foi possível carregar as estantes neste navegador.')
    })
    listShelfBooks().then((data) => { if (active) setBooks(data) }, () => {
      if (active) setBookError(true)
    })
    return () => { active = false }
  }, [attempt])

  async function change(operation, message) {
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      setShelves(await operation())
      setNotice(message)
      return true
    } catch (failure) {
      setError(failure instanceof ShelfError ? failure.message : 'Não foi possível salvar a alteração. Tente novamente.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function save(data) {
    const id = editing.id
    const saved = await change(() => id ? updateShelf(id, data) : createShelf(data),
      id ? 'Estante atualizada.' : 'Estante criada.')
    if (saved) setEditing(null)
  }

  async function remove(id) {
    setShelves(await deleteShelf(id))
    if (editing?.id === id) setEditing(null)
    setError('')
    setNotice('Estante excluída. Os livros continuam nas bibliotecas.')
  }

  const catalog = new Map(books?.map((book) => [book.key, book]))

  return (
    <section className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>Estantes personalizadas</h1>
        <button type="button" className={shared.primary} disabled={!shelves || busy}
          onClick={() => { setError(''); setEditing({}) }}>Nova estante</button>
      </header>
      <div className={styles.view}><DisplayModeSelect /></div>
      {error && <p role="alert" className={shared.error}>{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {editing && <ShelfForm key={editing.id ?? 'nova'} shelf={editing.id ? editing : undefined}
        onSave={save} onCancel={() => { setError(''); setEditing(null) }} busy={busy} />}
      {shelves?.length > 0 && (bookError ? <p role="alert" className={shared.error}>Não foi possível carregar os livros.</p> :
        !books ? <p role="status">Carregando livros…</p> :
          books.length > 0 ? <ShelfOrganizer books={books} shelves={shelves} busy={busy}
            onMove={(book, destination) => change(() => moveShelfBook(book, destination), 'Localização do livro atualizada.')} /> :
            <p className={shared.panel}>Cadastre ou importe livros para organizá-los aqui.</p>)}
      {!shelves ? (error ? (
        <div><button type="button" className={shared.secondary} onClick={() => {
          setError('')
          setAttempt((value) => value + 1)
        }}>Tentar novamente</button></div>
      ) : <p role="status">Carregando estantes…</p>) : shelves.length ? (
        <ul className={styles.shelves}>
          {shelves.map((shelf, index) => (
            <li key={shelf.id} className={shared.panel} style={{ '--shelf-color': shelf.color }}>
              <div className={styles.heading}>
                <div><h2>{shelf.name}</h2>{shelf.description && <p>{shelf.description}</p>}</div>
                <div className={shared.actions}>
                  <button type="button" className={shared.secondary} disabled={busy || index === 0}
                    aria-label={'Subir estante ' + shelf.name}
                    onClick={() => void change(() => reorderShelf(shelf.id, -1), 'Ordem atualizada.')}>Subir</button>
                  <button type="button" className={shared.secondary} disabled={busy || index === shelves.length - 1}
                    aria-label={'Descer estante ' + shelf.name}
                    onClick={() => void change(() => reorderShelf(shelf.id, 1), 'Ordem atualizada.')}>Descer</button>
                  <button type="button" className={shared.secondary} disabled={busy}
                    onClick={() => { setError(''); setEditing(shelf) }}>Editar estante</button>
                  <DeleteBookDialog title={shelf.name} action="Excluir estante" question="Excluir estante?" disabled={busy}
                    description="será excluída. Os livros continuam nas bibliotecas."
                    failure="Não foi possível excluir a estante. Tente novamente." onDelete={() => remove(shelf.id)} />
                </div>
              </div>
              {books && <ShelfContents shelf={shelf} catalog={catalog} />}
            </li>
          ))}
        </ul>
      ) : !editing && <p className={shared.panel}>Crie uma estante para organizar seus livros por tema ou coleção.</p>}
    </section>
  )
}
