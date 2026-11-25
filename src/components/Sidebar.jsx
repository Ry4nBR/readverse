import { createElement } from 'react'
import { BookOpen, LayoutDashboard } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { sections } from '../routes/sections.js'
import styles from './Sidebar.module.css'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  ...sections,
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Link className={styles.brand} to="/">
        <BookOpen size={24} aria-hidden="true" />
        BookShelf
      </Link>
      <nav aria-label="Menu principal">
        <ul className={styles.links}>
          {navigation.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink end to={to} className={styles.link}>
                {createElement(icon, { size: 18, 'aria-hidden': true })}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
