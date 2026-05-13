import { useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { User } from '../types'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    title: 'User Admin Panel',
    name: 'Name',
    roles: 'Roles',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    disabled: 'Disabled',
    block: 'Block',
    unblock: 'Unblock',
    removeAdmin: 'Remove admin',
    makeAdmin: 'Make admin',
  },
  ru: {
    title: 'Админ-панель пользователей',
    name: 'Имя',
    roles: 'Роли',
    status: 'Статус',
    actions: 'Действия',
    active: 'Активен',
    disabled: 'Отключен',
    block: 'Блок',
    unblock: 'Разблок',
    removeAdmin: 'Снять админ',
    makeAdmin: 'Сделать админ',
  },
} as const

export const AdminPage = () => {
  const { locale } = useSettings()
  const t = text[locale]
  const [users, setUsers] = useState<User[]>([])

  const load = () => {
    camiclockApi.adminUsers().then(setUsers)
  }

  useEffect(() => {
    load()
  }, [])

  const toggleActive = async (user: User) => {
    await camiclockApi.adminUpdateUser(user.id, { isActive: !user.isActive })
    load()
  }

  const toggleAdmin = async (user: User) => {
    const hasAdmin = user.roles.includes('ROLE_ADMIN')
    const roles = hasAdmin ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN']
    await camiclockApi.adminUpdateUser(user.id, { roles })
    load()
  }

  return (
    <section className="card">
      <h2>{t.title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>{t.name}</th>
              <th>{t.roles}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.roles.join(', ')}</td>
                <td>{user.isActive ? t.active : t.disabled}</td>
                <td className="btn-row">
                  <button className="ghost-btn" onClick={() => toggleActive(user)}>
                    {user.isActive ? t.block : t.unblock}
                  </button>
                  <button className="ghost-btn" onClick={() => toggleAdmin(user)}>
                    {user.roles.includes('ROLE_ADMIN') ? t.removeAdmin : t.makeAdmin}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
