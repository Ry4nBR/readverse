import { useEffect, useState } from 'react'
import { getPhysicalBook } from '../services/physicalBooks.js'

export function usePhysicalBook(id) {
  const [result, setResult] = useState(null)
  useEffect(() => {
    let active = true
    getPhysicalBook(id).then((book) => {
      if (active) setResult({ id, book })
    }, () => {
      if (active) setResult({ id, error: true })
    })
    return () => { active = false }
  }, [id])
  return result?.id === id ? result : null
}
