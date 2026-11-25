const backgrounds = {
  light: ['#fffdf8', '#f8f5ef'],
  dark: ['#242825', '#191b1a'],
  sepia: ['#fbefd8', '#f1e5cd'],
}

function channels(hex) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
}

function luminance(rgb) {
  const linear = rgb.map((channel) => {
    const value = channel / 255
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4
  })
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
}

export function contrastRatio(first, second) {
  const a = luminance(channels(first))
  const b = luminance(channels(second))
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}

export function accessibleAccent(hex, theme) {
  const target = theme === 'dark' ? 255 : 0
  const original = channels(hex)
  let accent = hex
  for (let step = 0; step <= 20; step++) {
    accent = '#' + original.map((value) =>
      Math.round(value + (target - value) * step / 20).toString(16).padStart(2, '0'),
    ).join('')
    if (backgrounds[theme].every((background) => contrastRatio(accent, background) >= 5.5)) break
  }
  const foreground = contrastRatio(accent, '#000000') >= contrastRatio(accent, '#ffffff') ? '#000000' : '#ffffff'
  return { accent, foreground }
}
