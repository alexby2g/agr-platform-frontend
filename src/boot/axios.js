import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agr-platform-backend-2.onrender.com/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agr_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers.Accept = 'application/json'

  return config
})

export { api }