import { Outlet } from 'react-router-dom'
import styles from './LibraryLayout.module.css'

export default function LibraryLayout() {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#conteudo">Pular para o conteúdo</a>
      <main id="conteudo" tabIndex={-1} className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
