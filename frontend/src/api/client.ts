import axios from 'axios'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('camiclock_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
