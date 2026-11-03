import { Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import Home from './views/Home.jsx'
import Login from './views/Login.jsx'
import Register from './views/Register.jsx'
import MateriasList from './views/MateriasList.jsx'
import MateriaDetail from './views/MateriaDetail.jsx'
import ExamenesList from './views/ExamenesList.jsx'
import Profile from './views/Profile.jsx'
import Unauthorized from './views/Unauthorized.jsx'
import NotFound from './views/NotFound.jsx'

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

      {/* Rutas protegidas con control de autenticación y RBAC */}
      <Route element={<RoleProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="materias" element={<MateriasList />} />
          <Route path="materias/:id" element={<MateriaDetail />} />
          <Route path="examenes" element={<ExamenesList />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Route>

      {/* Páginas de Error 403 y 404 dentro del Layout */}
      <Route element={<Layout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/403" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
