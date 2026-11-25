import { Route, Routes } from 'react-router-dom'
import LibraryLayout from '../layouts/LibraryLayout.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LibraryLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
