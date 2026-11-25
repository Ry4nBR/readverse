const events = new EventTarget()
let revision = 0

export const getBookRevision = () => revision

export function subscribeToBookChanges(listener) {
  events.addEventListener('change', listener)
  return () => events.removeEventListener('change', listener)
}

export function publishBookChange(result) {
  revision++
  events.dispatchEvent(new Event('change'))
  return result
}
