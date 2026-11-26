import assert from 'node:assert/strict'
import test from 'node:test'
import { lookupBook } from '../src/services/bookLookup.js'

const { Response } = globalThis
const isbn = '9780306406157'
const google = { items: [{ volumeInfo: {
  title: 'Título de teste',
  authors: ['Autora de teste'],
  publishedDate: '1999-04',
  description: 'Descrição em português.',
  industryIdentifiers: [{ identifier: '0306406152' }],
  imageLinks: { thumbnail: 'http://example.com/cover.jpg' },
} }] }

test('prioriza o Google Books e preserva campos ausentes', async (context) => {
  const fetch = context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url.searchParams.get('langRestrict'), 'pt')
    return Response.json(google)
  })
  const book = await lookupBook(isbn)
  assert.equal(fetch.mock.callCount(), 1)
  assert.equal(fetch.mock.calls[0].arguments[0].searchParams.get('q'), 'isbn:' + isbn)
  assert.equal(fetch.mock.calls[0].arguments[0].searchParams.get('langRestrict'), 'pt')
  assert.equal(book.title, 'Título de teste')
  assert.equal(book.author, 'Autora de teste')
  assert.equal(book.description, 'Descrição em português.')
  assert.equal(book.year, '1999')
  assert.equal(book.publisher, '')
  assert.equal(book.coverUrl, 'https://example.com/cover.jpg')
})

test('repete a consulta sem restrição de idioma quando o catálogo em português não encontra a edição', async (context) => {
  const fetch = context.mock.method(globalThis, 'fetch', async (url) =>
    Response.json(url.searchParams.has('langRestrict') ? { totalItems: 0 } : google))
  const book = await lookupBook(isbn)
  assert.equal(fetch.mock.callCount(), 2)
  assert.equal(fetch.mock.calls[0].arguments[0].searchParams.get('langRestrict'), 'pt')
  assert.equal(fetch.mock.calls[1].arguments[0].searchParams.has('langRestrict'), false)
  assert.equal(book.title, 'Título de teste')
})

test('consulta a Open Library diante de um resultado incompatível ou falha', async (context) => {
  for (const upstream of [{ items: [{ volumeInfo: { title: 'Outra edição' } }] }, null]) {
    const fetch = context.mock.method(globalThis, 'fetch', async (url) => {
      if (url.hostname === 'www.googleapis.com') {
        if (!upstream) throw new Error('Falha de rede simulada')
        return Response.json(upstream)
      }
      assert.equal(url.searchParams.get('bibkeys'), 'ISBN:' + isbn)
      return Response.json({ ['ISBN:' + isbn]: { title: 'Edição correta', publishers: [{ name: 'Editora' }] } })
    })
    assert.equal((await lookupBook(isbn)).publisher, 'Editora')
    assert.equal(fetch.mock.callCount(), 3)
    fetch.mock.restore()
  }
})

test('complementa a descrição pela edição e obra sem perder o resultado se a consulta adicional falhar', async (context) => {
  const catalog = { ['ISBN:' + isbn]: { title: 'Edição localizada', key: '/books/OL123M' } }
  const fetch = context.mock.method(globalThis, 'fetch', async (url) => {
    if (url.hostname === 'www.googleapis.com') return Response.json({ totalItems: 0 })
    if (url.pathname === '/api/books') return Response.json(catalog)
    if (url.pathname === '/books/OL123M.json') return Response.json({ works: [{ key: '/works/OL789W' }] })
    return Response.json({ description: { value: 'Descrição da obra' } })
  })
  assert.equal((await lookupBook(isbn)).description, 'Descrição da obra')
  fetch.mock.mockImplementation(async (url) => {
    if (url.hostname === 'www.googleapis.com') return Response.json({ totalItems: 0 })
    if (url.pathname === '/api/books') return Response.json(catalog)
    return new Response(null, { status: 503 })
  })
  assert.deepEqual(await lookupBook(isbn), {
    title: 'Edição localizada', author: '', publisher: '', year: '', isbn, description: '', coverUrl: '',
  })
})

test('diferencia pesquisa sem resultados de falha e rejeita ISBN inválido', async (context) => {
  const fetch = context.mock.method(globalThis, 'fetch', async (url) =>
    Response.json(url.hostname === 'www.googleapis.com' ? { totalItems: 0 } : {}))
  assert.equal(await lookupBook(isbn), null)
  await assert.rejects(lookupBook('1234'), /ISBN/)
  assert.equal(fetch.mock.callCount(), 3)
  fetch.mock.mockImplementation(async (url) => url.hostname === 'www.googleapis.com'
    ? new Response(null, { status: 429 }) : Response.json({}))
  assert.equal(await lookupBook(isbn), null)
  fetch.mock.mockImplementation(async () => new Response(null, { status: 503 }))
  await assert.rejects(lookupBook(isbn), /pesquisa não pôde/)
})
