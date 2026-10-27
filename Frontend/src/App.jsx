import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './views/Home.jsx'
import Login from './views/Login.jsx'
import Register from './views/Register.jsx'
import MateriasList from './views/MateriasList.jsx'
import MateriaDetail from './views/MateriaDetail.jsx'
import ExamenesList from './views/ExamenesList.jsx'
import Profile from './views/Profile.jsx'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="materias" element={<MateriasList />} />
          <Route path="materias/:id" element={<MateriaDetail />} />
          <Route path="examenes" element={<ExamenesList />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
