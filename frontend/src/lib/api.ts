import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://invoice-system-9ft4.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let accessToken: string | null = null

// Initialize token from localStorage on load
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('access_token')
}

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
  }
}

export const getAccessToken = () => {
  // Always check localStorage in case it was updated elsewhere
  if (typeof window !== 'undefined' && !accessToken) {
    accessToken = localStorage.getItem('access_token')
  }
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)
