import { useCallback, useRef, useState } from 'react'
import { updateBookReading } from '../services/bookReading.js'
import { saveDigitalReaderPosition } from '../services/digitalBooks.js'
import { readingOf } from '../utils/reading.js'

export function useReaderActivity(book, format) {
  const [activity, setActivity] = useState(() => readingOf(book))
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(Promise.resolve())
  const latest = useRef(null)

  const onPosition = useCallback((value, percentage) => {
    const key = value + ':' + Math.floor(percentage)
    if (latest.current === key) return
    latest.current = key
    pending.current = pending.current.then(async () => {
      try {
        setActivity(readingOf(await saveDigitalReaderPosition(book.id, format, value, percentage)))
        setReady(true)
        setError('')
      } catch {
        if (latest.current === key) latest.current = null
        setError('Não foi possível salvar a posição da leitura.')
      }
    })
  }, [book.id, format])

  async function finish() {
    setSaving(true)
    try {
      await pending.current
      const updated = await updateBookReading('digital', book.id, { status: 'finished' })
      setActivity(readingOf(updated))
      setError('')
    } catch {
      setError('Não foi possível concluir a leitura.')
    } finally {
      setSaving(false)
    }
  }

  return { activity, ready, error, saving, finish, onPosition }
}
