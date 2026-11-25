import { useState } from 'react'
import styles from './Reader.module.css'

export default function ReaderProgress({ activity, ready, error, saving, finish }) {
  const [confirming, setConfirming] = useState(false)
  return <section className={styles.progress} aria-label="Acompanhamento da leitura">
    <span>Progresso salvo <strong>{activity.progress}%</strong></span>
    <progress max={100} value={activity.progress} aria-label="Progresso salvo" />
    {activity.status === 'finished' ? <span role="status">Livro lido</span> : confirming ? (
      <div className={styles.controls}>
        <span>Marcar o livro como lido?</span>
        <button type="button" disabled={saving} onClick={async () => { await finish(); setConfirming(false) }}>
          {saving ? 'Salvando…' : 'Confirmar conclusão'}
        </button>
        <button type="button" disabled={saving} onClick={() => setConfirming(false)}>Cancelar</button>
      </div>
    ) : <button type="button" disabled={!ready} onClick={() => setConfirming(true)}>Concluir leitura</button>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </section>
}
