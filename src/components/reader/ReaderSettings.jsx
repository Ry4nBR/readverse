import { fonts, fontSizes, lineHeights, margins } from '../../services/readerPreferences.js'
import styles from './Reader.module.css'

export default function ReaderSettings({ preferences, onChange, error }) {
  const index = fontSizes.indexOf(preferences.size)
  return <details className={styles.settings}>
    <summary>Configurações de leitura</summary>
    <div className={styles.toolbar}>
      <div className={styles.controls} aria-label="Ajuste rápido da fonte">
        <button type="button" aria-label="Diminuir fonte" disabled={index === 0}
          onClick={() => onChange({ size: fontSizes[index - 1] })}>A−</button>
        <button type="button" aria-label="Aumentar fonte" disabled={index === fontSizes.length - 1}
          onClick={() => onChange({ size: fontSizes[index + 1] })}>A+</button>
      </div>
      <label>Tamanho da fonte
        <select value={preferences.size} onChange={(event) => onChange({ size: Number(event.target.value) })}>
          {fontSizes.map((value) => <option key={value} value={value}>{value} px</option>)}
        </select>
      </label>
      <label>Família da fonte
        <select value={preferences.font} onChange={(event) => onChange({ font: event.target.value })}>
          {Object.entries(fonts).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      </label>
      <label>Espaçamento entre linhas
        <select value={preferences.lineHeight} onChange={(event) => onChange({ lineHeight: Number(event.target.value) })}>
          {lineHeights.map((value) => <option key={value} value={value}>{String(value).replace('.', ',')}</option>)}
        </select>
      </label>
      <label>Margens de leitura
        <select value={preferences.margin} onChange={(event) => onChange({ margin: Number(event.target.value) })}>
          {margins.map((value) => <option key={value} value={value}>{value} px</option>)}
        </select>
      </label>
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </details>
}
