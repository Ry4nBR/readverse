import { useEffect, useState } from 'react'
import { useBookRevision } from './useBookRevision.js'
import { listPhysicalBooks } from '../services/physicalBooks.js'

export function usePhysicalBooks() {
  const revision = useBookRevision()
  const [books, setBooks] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    listPhysicalBooks().then((entries) => {
      if (active) setBooks(entries.sort((a, b) => b.createdAt - a.createdAt))
    }, () => {
      if (active) setLoadError(true)
    })
    return () => { active = false }
  }, [attempt, revision])

  function retry() {
    setLoadError(false)
    setAttempt((current) => current + 1)
  }

  return { books, loadError, retry }
}
