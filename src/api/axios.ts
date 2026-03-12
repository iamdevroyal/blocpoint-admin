import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const apiClient: AxiosInstance = axios.create({
    // Point to Laravel's public root; all paths should be absolute from there.
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/blocpoint/blocpoint-api/public',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token')
    if (token && token !== 'session') {
        config.headers.Authorization = `Bearer ${token}`
    }


    // Add Correlation ID
    config.headers['X-Correlation-Id'] = crypto.randomUUID()

    // Add Idempotency Key for mutating requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
        config.headers['Idempotency-Key'] = crypto.randomUUID()

        // Explicitly send X-XSRF-TOKEN header if cookie is present (helps with cross-port CSRF)
        const xsrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1]

        if (xsrfToken) {
            config.headers['X-XSRF-Token'] = decodeURIComponent(xsrfToken)
        }
    }

    return config
}, (error: AxiosError) => {
    return Promise.reject(error)
})

apiClient.interceptors.response.use((response: AxiosResponse) => {
    return response
}, async (error: AxiosError) => {
    if (error.response?.status === 401) {
        // Basic auth failure handling
        localStorage.removeItem('admin_token')
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'
        }
    }
    return Promise.reject(error)
})

export default apiClient
