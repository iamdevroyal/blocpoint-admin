import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../api/axios'

interface AdminUser {
    id: string
    name: string
    email: string
    roles: string[]
    permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('admin_token'))
    const user = ref<AdminUser | null>(null)
    const loading = ref(false)
    const pendingTwoFactor = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const hasPermission = (permission: string) => user.value?.permissions.includes(permission) || user.value?.roles.includes('super_admin')

    async function login(credentials: Record<string, string>): Promise<{ twoFactorRequired: boolean }> {
        loading.value = true
        try {
            // Ensure CSRF cookie (for session-based auth) is set
            await apiClient.get('/sanctum/csrf-cookie')

            // Hit backend admin login endpoint
            const response = await apiClient.post('/api/v1/admin/auth/login', {
                email: credentials.email,
                password: credentials.password,
            })

            const data = response.data?.data

            if (data?.two_factor_required) {
                pendingTwoFactor.value = true
                // Do not set user yet; full auth happens after 2FA verification
                return { twoFactorRequired: true }
            }

            const admin = data?.admin as { id: string; name: string; email: string; role?: string }

            user.value = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                roles: admin.role ? [admin.role] : [],
                permissions: [],
            }

            // Session is cookie-based (Laravel guard: admin); we still keep a simple flag token.
            token.value = 'session'
            localStorage.setItem('admin_token', token.value)

            pendingTwoFactor.value = false
            return { twoFactorRequired: false }
        } catch (e: any) {
            console.error('Login error', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            await apiClient.post('/api/v1/admin/auth/logout')
        } catch (e) {
            // ignore backend errors on logout
        } finally {
            token.value = null
            user.value = null
            pendingTwoFactor.value = false
            localStorage.removeItem('admin_token')
        }
    }

    async function verifyTwoFactor(code: string): Promise<void> {
        loading.value = true
        try {
            const response = await apiClient.post('/api/v1/admin/auth/2fa/verify', {
                code,
            })

            const data = response.data?.data
            const admin = data?.admin as { id: string; name: string; email: string; role?: string }

            user.value = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                roles: admin.role ? [admin.role] : [],
                permissions: [],
            }

            token.value = 'session'
            localStorage.setItem('admin_token', token.value)
            pendingTwoFactor.value = false
        } catch (e: any) {
            console.error('Two-factor verification error', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    async function fetchUser() {
        if (!token.value) return
        try {
            console.log('Mocking fetchUser for development')
            user.value = {
                id: 'mock-uuid',
                name: 'Dev Admin',
                email: 'admin@blocpoint.com',
                roles: ['super_admin'],
                permissions: ['all']
            }
        } catch (e) {
            logout() // invalid token
        }
    }

    return {
        token,
        user,
        loading,
        pendingTwoFactor,
        isAuthenticated,
        hasPermission,
        login,
        logout,
        fetchUser,
        verifyTwoFactor,
    }
})
