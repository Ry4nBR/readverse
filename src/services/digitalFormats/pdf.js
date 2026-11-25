import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function inspectPdf(bytes) {
  const task = getDocument({ data: bytes, isEvalSupported: false, stopAtErrors: true })
  try {
    const document = await task.promise
    await document.getPage(1)
    const result = await document.getMetadata().catch(() => null)
    if (!result) return {}
    const { info, metadata } = result
    return {
      title: clean(info.Title) || clean(metadata?.get('dc:title')),
      author: clean(info.Author) || clean(metadata?.get('dc:creator')),
      description: clean(info.Subject) || clean(metadata?.get('dc:description')),
    }
  } catch (error) {
    if (error.name === 'PasswordException') return {}
    throw new Error('Não foi possível abrir a estrutura do PDF.', { cause: error })
  } finally {
    await task.destroy()
  }
}
