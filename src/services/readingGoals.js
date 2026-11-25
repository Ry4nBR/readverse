const goalKey = (year) => 'bookshelf.reading-goal.v1.' + year

export function getReadingGoal(year) {
  const value = Number(globalThis.localStorage.getItem(goalKey(year)))
  return Number.isInteger(value) && value >= 1 && value <= 9999 ? value : null
}

export function saveReadingGoal(year, goal) {
  if (!Number.isInteger(goal) || goal < 1 || goal > 9999) {
    throw new RangeError('Informe uma meta de 1 a 9.999 livros.')
  }
  globalThis.localStorage.setItem(goalKey(year), String(goal))
  return goal
}
