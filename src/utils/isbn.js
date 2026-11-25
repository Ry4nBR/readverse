export function normalizeIsbn(value) {
  return value.toUpperCase().replace(/[\s-]/g, '')
}

function isbn13CheckDigit(digits) {
  const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
  return (10 - sum % 10) % 10
}

export function isValidIsbn(value) {
  const isbn = normalizeIsbn(value)
  if (/^(978|979)\d{10}$/.test(isbn)) {
    return isbn13CheckDigit(isbn.slice(0, -1)) === Number(isbn.at(-1))
  }
  if (!/^\d{9}[\dX]$/.test(isbn)) return false
  const sum = [...isbn].reduce((total, digit, index) => total + (digit === 'X' ? 10 : Number(digit)) * (10 - index), 0)
  return sum % 11 === 0
}

export function isbnKey(value) {
  const isbn = normalizeIsbn(value)
  if (!isValidIsbn(isbn)) return undefined
  if (isbn.length === 13) return isbn
  const prefix = '978' + isbn.slice(0, 9)
  return prefix + isbn13CheckDigit(prefix)
}
