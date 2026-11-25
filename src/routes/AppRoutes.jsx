import { Route, Routes } from 'react-router-dom'
import LibraryLayout from '../layouts/LibraryLayout.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

import NewPhysicalBookPage from '../pages/NewPhysicalBookPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import PhysicalShelfPage from '../pages/PhysicalShelfPage.jsx'
import SectionPage from '../pages/SectionPage.jsx'
import { sections } from './sections.js'

const futureSections = sections.filter(({ to }) => !['/cadastro', '/biblioteca'].includes(to))

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LibraryLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="biblioteca" element={<PhysicalShelfPage />} />
        <Route path="cadastro" element={<NewPhysicalBookPage />} />
        {futureSections.map(({ to, label }) => (
          <Route key={to} path={to} element={<SectionPage title={label} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
