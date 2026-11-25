import assert from 'node:assert/strict'
import test from 'node:test'
import { isbnKey, isValidIsbn, normalizeIsbn } from '../src/utils/isbn.js'

test('valida ISBN-10, ISBN-13 e dígito X', () => {
  for (const isbn of ['0-306-40615-2', '978 0 306 40615 7', '0-8044-2957-x', '9791090636071']) {
    assert.ok(isValidIsbn(isbn), isbn)
  }
  for (const isbn of ['', '9780306406158', '0306406153', '1234567890128', '0306406152!']) {
    assert.equal(isValidIsbn(isbn), false, isbn)
  }
})

test('ISBN-10 e ISBN-13 da mesma edição têm a mesma chave', () => {
  assert.equal(normalizeIsbn(' 0-8044-2957-x '), '080442957X')
  assert.equal(isbnKey('0306406152'), isbnKey('9780306406157'))
  assert.equal(isbnKey(''), undefined)
})
