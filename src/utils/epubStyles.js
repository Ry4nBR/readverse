const typography = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'system-ui, Arial, sans-serif',
}

export function applyEpubStyles(contents, preferences) {
  const doc = contents.document
  let style = doc.getElementById('bookshelf-reader-style')
  if (!style) {
    style = doc.createElement('style')
    style.id = 'bookshelf-reader-style'
    doc.head.append(style)
  }
  const font = typography[preferences.font]
  style.textContent = `
    html, html body { font-size: ${preferences.size}px !important; }
    body, body p, body li, body blockquote, body dt, body dd, body h1, body h2, body h3, body h4 {
      font-family: ${font} !important; line-height: ${preferences.lineHeight} !important;
    }
    body p, body li, body blockquote, body dt, body dd { font-size: ${preferences.size}px !important; }
    html body { padding-inline: min(${preferences.margin}px, 12vw) !important; }
  `
}
