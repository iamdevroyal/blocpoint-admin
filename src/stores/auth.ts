import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    const isAuthenticated = computed(() => !!token.value)
    const hasPermission = (permission: string) => user.value?.permissions.includes(permission) || user.value?.roles.includes('super_admin')

    async function login(credentials: Record<string, string>) {
        loading.value = true
        try {
            console.log('Mocking login for development:', credentials)

            // Mock successful response
            const mockUser: AdminUser = {
                id: 'mock-uuid',
                name: 'Dev Admin',
                email: credentials.email || 'admin@blocpoint.com',
                roles: ['super_admin'],
                permissions: ['all']
            }
            const mockToken = 'mock-jwt-token-for-dev'

            token.value = mockToken
            user.value = mockUser

            localStorage.setItem('admin_token', mockToken)
            return true
        } catch (e) {
            console.error('Login error', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('admin_token')
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
        isAuthenticated,
        hasPermission,
        login,
        logout,
        fetchUser
    }
})
