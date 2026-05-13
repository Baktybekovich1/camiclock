import { useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    title: 'Profile',
    firstName: 'First name',
    lastName: 'Last name',
    saved: 'Profile saved',
    submit: 'Save',
  },
  ru: {
    title: 'Профиль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    saved: 'Профиль сохранен',
    submit: 'Сохранить',
  },
} as const

export const ProfilePage = () => {
  const { user, refreshMe } = useAuth()
  const { locale } = useSettings()
  const t = text[locale]
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [status, setStatus] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await camiclockApi.updateMe({ firstName, lastName })
    await refreshMe()
    setStatus(t.saved)
  }

  return (
    <section className="card narrow">
      <h2>{t.title}</h2>
      <form onSubmit={submit} className="form-col">
        <label>
          {t.firstName}
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          {t.lastName}
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        {status && <p className="ok-text">{status}</p>}
        <button type="submit" className="primary-btn">
          {t.submit}
        </button>
      </form>
    </section>
  )
}
