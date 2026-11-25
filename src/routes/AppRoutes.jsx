import { Route, Routes } from 'react-router-dom'
import AppearancePage from '../pages/AppearancePage.jsx'
import LibraryLayout from '../layouts/LibraryLayout.jsx'
import CustomShelvesPage from '../pages/CustomShelvesPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

import DigitalBookDetailsPage from '../pages/DigitalBookDetailsPage.jsx'
import DigitalShelfPage from '../pages/DigitalShelfPage.jsx'
import DigitalImportPage from '../pages/DigitalImportPage.jsx'
import EditDigitalBookPage from '../pages/EditDigitalBookPage.jsx'
import EditPhysicalBookPage from '../pages/EditPhysicalBookPage.jsx'
import NewPhysicalBookPage from '../pages/NewPhysicalBookPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import PhysicalBookDetailsPage from '../pages/PhysicalBookDetailsPage.jsx'
import PhysicalShelfPage from '../pages/PhysicalShelfPage.jsx'
import SectionPage from '../pages/SectionPage.jsx'
import { sections } from './sections.js'

const futureSections = sections.filter(({ to }) => !['/cadastro', '/biblioteca', '/biblioteca-digital', '/importacao', '/estantes', '/aparencia'].includes(to))

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LibraryLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="biblioteca" element={<PhysicalShelfPage />} />
        <Route path="biblioteca/:bookId" element={<PhysicalBookDetailsPage />} />
        <Route path="biblioteca/:bookId/editar" element={<EditPhysicalBookPage />} />
        <Route path="biblioteca-digital" element={<DigitalShelfPage />} />
        <Route path="biblioteca-digital/:bookId" element={<DigitalBookDetailsPage />} />
        <Route path="biblioteca-digital/:bookId/editar" element={<EditDigitalBookPage />} />
        <Route path="importacao" element={<DigitalImportPage />} />
        <Route path="aparencia" element={<AppearancePage />} />
        <Route path="estantes" element={<CustomShelvesPage />} />
        <Route path="cadastro" element={<NewPhysicalBookPage />} />
        {futureSections.map(({ to, label }) => (
          <Route key={to} path={to} element={<SectionPage title={label} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
