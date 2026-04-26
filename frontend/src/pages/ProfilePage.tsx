import { useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import { useAuth } from '../context/AuthContext'

export const ProfilePage = () => {
  const { user, refreshMe } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [status, setStatus] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await camiclockApi.updateMe({ firstName, lastName })
    await refreshMe()
    setStatus('Профиль сохранен')
  }

  return (
    <section className="card narrow">
      <h2>Профиль</h2>
      <form onSubmit={submit} className="form-col">
        <label>
          Имя
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Фамилия
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        {status && <p className="ok-text">{status}</p>}
        <button type="submit" className="primary-btn">
          Сохранить
        </button>
      </form>
    </section>
  )
}
