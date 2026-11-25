import { BookMarked, BookOpen, Import, LibraryBig, Plus } from 'lucide-react'

export const sections = [
  { to: '/biblioteca', label: 'Meus livros', icon: BookMarked },
  { to: '/cadastro', label: 'Cadastrar livro', icon: Plus },
  { to: '/importacao', label: 'Importar arquivo', icon: Import },
  { to: '/estantes', label: 'Estantes', icon: LibraryBig },
  { to: '/leituras', label: 'Leituras', icon: BookOpen },
]
