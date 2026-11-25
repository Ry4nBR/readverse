import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
    </Routes>
  )
}
