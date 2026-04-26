import { api } from './client'
import type { Category, DashboardSummary, Plan, TimerEntry, User } from '../types'

export const camiclockApi = {
  about: async () => {
    const { data } = await api.get('/api/about')
    return data
  },

  register: async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
    const { data } = await api.post('/api/register', payload)
    return data
  },

  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post('/api/login_check', payload)
    return data as { token: string }
  },

  me: async () => {
    const { data } = await api.get('/api/me')
    return data.user as User
  },

  updateMe: async (payload: { firstName?: string; lastName?: string }) => {
    const { data } = await api.patch('/api/me', payload)
    return data
  },

  categories: async () => {
    const { data } = await api.get('/api/categories')
    return data.categories as Category[]
  },

  createCategory: async (payload: { name: string; color: string }) => {
    const { data } = await api.post('/api/categories', payload)
    return data
  },

  updateCategory: async (id: number, payload: { name?: string; color?: string }) => {
    const { data } = await api.patch(`/api/categories/${id}`, payload)
    return data
  },

  deleteCategory: async (id: number) => {
    const { data } = await api.delete(`/api/categories/${id}`)
    return data
  },

  timerStart: async (categoryId: number) => {
    const { data } = await api.post('/api/timers/start', { categoryId })
    return data
  },

  timerStop: async () => {
    const { data } = await api.post('/api/timers/stop')
    return data
  },

  timerRunning: async () => {
    const { data } = await api.get('/api/timers/running')
    return data.entry as null | {
      id: number
      categoryId: number
      categoryName: string
      categoryColor: string
      startedAt: string
    }
  },

  timerList: async (period: 'day' | 'week') => {
    const { data } = await api.get('/api/timers', { params: { period } })
    return data.entries as TimerEntry[]
  },

  plans: async (periodType: 'day' | 'week') => {
    const { data } = await api.get('/api/plans', { params: { periodType } })
    return data.plans as Plan[]
  },

  upsertPlan: async (payload: {
    categoryId: number
    periodType: 'day' | 'week'
    targetMinutes: number
    periodStart?: string
  }) => {
    const { data } = await api.post('/api/plans', payload)
    return data
  },

  deletePlan: async (id: number) => {
    const { data } = await api.delete(`/api/plans/${id}`)
    return data
  },

  summary: async (periodType: 'day' | 'week') => {
    const { data } = await api.get('/api/dashboard/summary', { params: { periodType } })
    return data as { success: true } & DashboardSummary
  },

  adminUsers: async () => {
    const { data } = await api.get('/api/admin/users')
    return data.users as User[]
  },

  adminUpdateUser: async (id: number, payload: { isActive?: boolean; roles?: string[] }) => {
    const { data } = await api.patch(`/api/admin/users/${id}`, payload)
    return data
  },
}
