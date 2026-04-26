import { useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { User } from '../types'

export const AdminPage = () => {
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
      <h2>Админ-панель пользователей</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Роли</th>
              <th>Статус</th>
              <th>Действия</th>
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
                <td>{user.isActive ? 'Активен' : 'Отключен'}</td>
                <td className="btn-row">
                  <button className="ghost-btn" onClick={() => toggleActive(user)}>
                    {user.isActive ? 'Блок' : 'Разблок'}
                  </button>
                  <button className="ghost-btn" onClick={() => toggleAdmin(user)}>
                    {user.roles.includes('ROLE_ADMIN') ? 'Снять админ' : 'Сделать админ'}
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
