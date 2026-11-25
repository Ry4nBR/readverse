import styles from './Reader.module.css'

export default function ReaderNavigation({ label, previous, next, disablePrevious, disableNext }) {
  return <nav className={styles.controls} aria-label="Navegação por páginas">
    <button type="button" onClick={previous} disabled={disablePrevious}>Página anterior</button>
    <span role="status">{label}</span>
    <button type="button" onClick={next} disabled={disableNext}>Próxima página</button>
  </nav>
}
