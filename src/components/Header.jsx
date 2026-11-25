import { LibraryBig } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <LibraryBig size={18} aria-hidden="true" />
      Biblioteca pessoal
    </header>
  )
}
