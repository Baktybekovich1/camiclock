import { Link, NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export const AppLayout = () => {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)
  const authMenu = (
    <>
      <NavLink to="/focus" onClick={closeMobile}>
        Фокус
      </NavLink>
      <NavLink to="/categories" onClick={closeMobile}>
        Категории
      </NavLink>
      <NavLink to="/plans" onClick={closeMobile}>
        Планы
      </NavLink>
      <NavLink to="/profile" onClick={closeMobile}>
        Профиль
      </NavLink>
      {user?.roles.includes('ROLE_ADMIN') && (
        <NavLink to="/admin" onClick={closeMobile}>
          Admin
        </NavLink>
      )}
      <button
        className="ghost-btn"
        onClick={() => {
          logout()
          closeMobile()
        }}
      >
        Выйти
      </button>
    </>
  )

  return (
    <div className="page-shell">
      <header className="topbar">
        <Link to={user ? '/focus' : '/'} className="logo">
          CamiClock
        </Link>

        <button
          className="burger-btn"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="topnav">
          {!user && (
            <NavLink to="/" onClick={closeMobile}>
              About
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" onClick={closeMobile}>
              Login
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" onClick={closeMobile}>
              Register
            </NavLink>
          )}

          {user && authMenu}
        </nav>
      </header>

      {mobileOpen && <button type="button" aria-label="Close mobile menu" className="mobile-backdrop" onClick={closeMobile} />}

      <aside className={mobileOpen ? 'mobile-drawer open' : 'mobile-drawer'}>
        <div className="mobile-drawer-header">
          <strong>Меню</strong>
          <button type="button" className="ghost-btn" onClick={closeMobile}>
            Закрыть
          </button>
        </div>
        <nav className="mobile-drawer-nav">
          {!user && (
            <NavLink to="/" onClick={closeMobile}>
              About
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" onClick={closeMobile}>
              Login
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" onClick={closeMobile}>
              Register
            </NavLink>
          )}
          {user && authMenu}
        </nav>
      </aside>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="main-content"
      >
        <Outlet />
      </motion.main>

      {user && (
        <nav className="mobile-tabbar">
          <NavLink to="/focus">Фокус</NavLink>
          <NavLink to="/categories">Категории</NavLink>
          <NavLink to="/plans">Планы</NavLink>
        </nav>
      )}
    </div>
  )
}
