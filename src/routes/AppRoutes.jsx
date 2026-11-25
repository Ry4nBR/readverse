import { Route, Routes } from 'react-router-dom'
import LibraryLayout from '../layouts/LibraryLayout.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

import SectionPage from '../pages/SectionPage.jsx'
import { sections } from './sections.js'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LibraryLayout />}>
        <Route index element={<DashboardPage />} />
        {sections.map(({ to, label }) => (
          <Route key={to} path={to} element={<SectionPage title={label} />} />
        ))}
      </Route>
    </Routes>
  )
}
