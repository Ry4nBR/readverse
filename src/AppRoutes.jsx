import { Route, Routes } from 'react-router-dom'

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<h1>BookShelf</h1>} />
    </Routes>
  )
}
