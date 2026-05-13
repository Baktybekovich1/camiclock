import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    title: 'Login',
    password: 'Password',
    submit: 'Sign in',
    error: 'Invalid email or password',
  },
  ru: {
    title: 'Вход',
    password: 'Пароль',
    submit: 'Войти',
    error: 'Неверный логин или пароль',
  },
} as const

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { locale } = useSettings()
  const t = text[locale]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError(t.error)
    }
  }

  return (
    <section className="card narrow">
      <h2>{t.title}</h2>
      <form onSubmit={submit} className="form-col">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t.password}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary-btn">
          {t.submit}
        </button>
      </form>
    </section>
  )
}
