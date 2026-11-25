const events = new EventTarget()

export function subscribeToBookChanges(listener) {
  events.addEventListener('change', listener)
  return () => events.removeEventListener('change', listener)
}

export function publishBookChange(result) {
  events.dispatchEvent(new Event('change'))
  return result
}
