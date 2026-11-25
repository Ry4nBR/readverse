import { useSyncExternalStore } from 'react'
import { getBookRevision, subscribeToBookChanges } from '../services/bookChanges.js'

const initialRevision = () => 0

export function useBookRevision() {
  return useSyncExternalStore(subscribeToBookChanges, getBookRevision, initialRevision)
}
