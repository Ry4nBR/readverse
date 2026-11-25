import assert from 'node:assert/strict'
import test from 'node:test'
import { detectDigitalFormat, digitalFileHash, maxDigitalFileSize } from '../src/services/digitalFile.js'

const { File, TextEncoder } = globalThis

test('verifica extensão, tipo, assinaturas e tamanho antes da extração', async () => {
  assert.equal(await detectDigitalFormat(new File(['%PDF-1.7\n%%EOF\n'], 'livro.PDF')), 'pdf')
  assert.equal(await detectDigitalFormat(new File(['PK\x03\x04'], 'livro.epub', { type: 'application/zip' })), 'epub')
  assert.equal(await detectDigitalFormat(new File([' '.repeat(60), 'BOOKMOBI'], 'livro.mobi')), 'mobi')
  await assert.rejects(detectDigitalFormat(new File(['%PDF-1.7'], 'livro.pdf')), /conteúdo/)
  await assert.rejects(detectDigitalFormat(new File(['texto'], 'livro.epub')), /conteúdo/)
  await assert.rejects(detectDigitalFormat(new File(['%PDF-1.7\n%%EOF'], 'livro.pdf', { type: 'text/plain' })), /tipo/)
  await assert.rejects(detectDigitalFormat({ name: 'grande.pdf', size: maxDigitalFileSize + 1 }), /100 MB/)
  await assert.rejects(detectDigitalFormat(new File([], 'vazio.mobi')), /conteúdo/)
  await assert.rejects(detectDigitalFormat(new File(['x'], 'livro.txt')), /Selecione/)
})

test('identifica arquivos de conteúdo idêntico pelo SHA-256', async () => {
  const bytes = new TextEncoder().encode('abc')
  assert.equal(await digitalFileHash(bytes), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
})
