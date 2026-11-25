import { useEffect, useState } from 'react'
import { listShelfBooks } from '../services/shelfCatalog.js'
import { useBookRevision } from './useBookRevision.js'

export function useReadingCatalog() {
  const revision = useBookRevision()
  const [books, setBooks] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    listShelfBooks().then((data) => {
      if (active) {
        setBooks(data)
        setError(false)
      }
    }, () => { if (active) setError(true) })
    return () => { active = false }
  }, [revision, attempt])

  function retry() {
    setError(false)
    setAttempt((current) => current + 1)
  }

  return { books, error, retry }
}
