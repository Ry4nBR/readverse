import { BookOpen } from 'lucide-react'
import { useCallback, useState } from 'react'
import styles from './PhysicalBook.module.css'

export default function BookCover({ coverBlob, coverUrl }) {
  const [failed, setFailed] = useState(null)
  const cover = coverBlob || coverUrl
  const imageRef = useCallback((image) => {
    if (!image || !coverBlob) return
    const objectUrl = URL.createObjectURL(coverBlob)
    image.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [coverBlob])

  return (
    <div className={styles.cover}>
      {cover && cover !== failed ? (
        <img ref={imageRef} src={coverBlob ? undefined : coverUrl} alt="Capa do livro"
          onError={() => setFailed(cover)} />
      ) : <BookOpen aria-label="Livro sem capa" role="img" />}
    </div>
  )
}
