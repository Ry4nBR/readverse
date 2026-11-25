export function flattenToc(entries, depth = 0) {
  return entries.flatMap((entry) => [
    ...(entry.href && entry.label?.trim() ? [{ href: entry.href, label: entry.label.trim(), depth }] : []),
    ...flattenToc(entry.subitems ?? [], depth + 1),
  ])
}

export function epubLocation(publication, location) {
  const start = location.start
  if (!start?.cfi) return null
  const section = publication.spine.get(start.index)
  return {
    cfi: start.cfi, index: start.index, href: start.href, page: start.displayed.page, pages: start.displayed.total,
    first: location.atStart, last: location.atEnd,
    previousChapter: section?.prev()?.href, nextChapter: section?.next()?.href,
    chapters: publication.spine.spineItems.length,
  }
}
