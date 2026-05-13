import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { camiclockApi } from '../api/camiclockApi'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    title: 'Register',
    firstName: 'First name',
    lastName: 'Last name',
    password: 'Password',
    submit: 'Create account',
    success: 'Account created. Please log in.',
    error: 'Registration failed',
  },
  ru: {
    title: 'Регистрация',
    firstName: 'Имя',
    lastName: 'Фамилия',
    password: 'Пароль',
    submit: 'Создать аккаунт',
    success: 'Аккаунт создан. Выполните вход.',
    error: 'Не удалось зарегистрироваться',
  },
} as const

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { locale } = useSettings()
  const t = text[locale]
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await camiclockApi.register(form)
      setSuccess(t.success)
      setTimeout(() => navigate('/login'), 900)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t.error)
    }
  }

  return (
    <section className="card narrow">
      <h2>{t.title}</h2>
      <form onSubmit={submit} className="form-col">
        <label>
          {t.firstName}
          <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        </label>
        <label>
          {t.lastName}
          <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </label>
        <label>
          {t.password}
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="ok-text">{success}</p>}
        <button type="submit" className="primary-btn">
          {t.submit}
        </button>
      </form>
    </section>
  )
}
