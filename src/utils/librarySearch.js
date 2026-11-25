export function searchKey(value) {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{M}/gu, '')
}
