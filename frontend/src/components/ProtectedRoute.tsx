import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="center-card">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const AdminRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="center-card">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
