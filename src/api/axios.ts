import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

/**
 * Axios instance for blocpoint-admin.
 *
 * Authentication: Sanctum Bearer token (stateless).
 * The token is stored in localStorage under 'admin_token' and attached
 * via the Authorization header on every request.
 *
 * withCredentials is NOT set — admin panel now uses Bearer tokens which are
 * inherently CSRF-proof and work across any deployment domain.
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/blocpoint/blocpoint-api/public/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// ── Request interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Attach Bearer token if present
    const token = localStorage.getItem('admin_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    // Correlation ID — tracing across services
    config.headers['X-Correlation-Id'] = crypto.randomUUID()

    // Idempotency key — prevents duplicate mutations on retry
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
        config.headers['Idempotency-Key'] = crypto.randomUUID()
    }

    return config
}, (error: AxiosError) => {
    return Promise.reject(error)
})

// ── Response interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use((response: AxiosResponse) => {
    return response
}, async (error: AxiosError) => {
    if (error.response?.status === 401) {
        // Token expired or revoked — clear and redirect to login
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'
        }
    }
    return Promise.reject(error)
})

export default apiClient
