import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { camiclockApi } from '../api/camiclockApi'

export const RegisterPage = () => {
  const navigate = useNavigate()
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
      setSuccess('Аккаунт создан. Выполните вход.')
      setTimeout(() => navigate('/login'), 900)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Не удалось зарегистрироваться')
    }
  }

  return (
    <section className="card narrow">
      <h2>Регистрация</h2>
      <form onSubmit={submit} className="form-col">
        <label>
          Имя
          <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        </label>
        <label>
          Фамилия
          <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </label>
        <label>
          Пароль
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="ok-text">{success}</p>}
        <button type="submit" className="primary-btn">
          Создать аккаунт
        </button>
      </form>
    </section>
  )
}
