import { Link, NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    focus: 'Focus',
    categories: 'Categories',
    plans: 'Plans',
    profile: 'Profile',
    logout: 'Logout',
    menu: 'Menu',
    close: 'Close',
    about: 'About',
    login: 'Login',
    register: 'Register',
    toggleMenu: 'Toggle menu',
    closeMenu: 'Close mobile menu',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    theme: 'Theme',
  },
  ru: {
    focus: 'Фокус',
    categories: 'Категории',
    plans: 'Планы',
    profile: 'Профиль',
    logout: 'Выйти',
    menu: 'Меню',
    close: 'Закрыть',
    about: 'О проекте',
    login: 'Вход',
    register: 'Регистрация',
    toggleMenu: 'Открыть меню',
    closeMenu: 'Закрыть мобильное меню',
    dark: 'Темная',
    light: 'Светлая',
    language: 'Язык',
    theme: 'Тема',
  },
} as const

export const AppLayout = () => {
  const { user, logout } = useAuth()
  const { locale, setLocale, theme, toggleTheme } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = text[locale]

  const closeMobile = () => setMobileOpen(false)
  const authMenu = (
    <>
      <NavLink to="/focus" onClick={closeMobile}>
        {t.focus}
      </NavLink>
      <NavLink to="/categories" onClick={closeMobile}>
        {t.categories}
      </NavLink>
      <NavLink to="/plans" onClick={closeMobile}>
        {t.plans}
      </NavLink>
      <NavLink to="/profile" onClick={closeMobile}>
        {t.profile}
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
        {t.logout}
      </button>
    </>
  )

  return (
    <div className="page-shell">
      <header className="topbar">
        <Link to={user ? '/focus' : '/'} className="logo">
          BloomB
        </Link>

        <button className="burger-btn" type="button" aria-label={t.toggleMenu} onClick={() => setMobileOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>

        <nav className="topnav">
          <label className="control-select compact" aria-label={t.language}>
            <span>🌐 {t.language}</span>
            <select value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'ru')}>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </label>
          <button className="ghost-btn theme-btn" type="button" onClick={toggleTheme}>
            ◐ {t.theme}: {theme === 'dark' ? t.light : t.dark}
          </button>

          {!user && (
            <NavLink to="/" onClick={closeMobile}>
              {t.about}
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" onClick={closeMobile}>
              {t.login}
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" onClick={closeMobile}>
              {t.register}
            </NavLink>
          )}

          {user && authMenu}
        </nav>
      </header>

      {mobileOpen && <button type="button" aria-label={t.closeMenu} className="mobile-backdrop" onClick={closeMobile} />}

      <aside className={mobileOpen ? 'mobile-drawer open' : 'mobile-drawer'}>
        <div className="mobile-drawer-header">
          <strong>{t.menu}</strong>
          <button type="button" className="ghost-btn" onClick={closeMobile}>
            {t.close}
          </button>
        </div>
        <nav className="mobile-drawer-nav">
          <label className="control-select">
            <span>🌐 {t.language}</span>
            <select value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'ru')}>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </label>
          <button className="ghost-btn theme-btn" type="button" onClick={toggleTheme}>
            ◐ {t.theme}: {theme === 'dark' ? t.light : t.dark}
          </button>
          {!user && (
            <NavLink to="/" onClick={closeMobile}>
              {t.about}
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" onClick={closeMobile}>
              {t.login}
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" onClick={closeMobile}>
              {t.register}
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
          <NavLink to="/focus">{t.focus}</NavLink>
          <NavLink to="/categories">{t.categories}</NavLink>
          <NavLink to="/plans">{t.plans}</NavLink>
        </nav>
      )}
    </div>
  )
}
