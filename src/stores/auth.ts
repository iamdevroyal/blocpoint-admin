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

    /**
     * Check if the current admin has a given permission or is a super_admin.
     */
    const hasPermission = (permission: string) =>
        user.value?.permissions.includes(permission) ||
        user.value?.roles.includes('super_admin')

    /**
     * Login with email and password.
     *
     * If 2FA is disabled: backend returns a full-access admin token which is stored.
     * If 2FA is enabled:  backend returns a short-lived pre-auth token (5 min,
     * ability:2fa_pending). This is stored temporarily under 'admin_preauth_token'
     * and used exclusively for the POST /admin/auth/2fa/verify call.
     */
    async function login(credentials: Record<string, string>): Promise<{ twoFactorRequired: boolean }> {
        loading.value = true
        try {
            const response = await apiClient.post('/admin/auth/login', {
                email: credentials.email,
                password: credentials.password,
            })

            const data = response.data?.data

            if (data?.two_factor_required) {
                // Store the short-lived pre-auth token for the 2FA verify call
                localStorage.setItem('admin_preauth_token', data.token)
                pendingTwoFactor.value = true
                return { twoFactorRequired: true }
            }

            // No 2FA — store the full access token and user
            _setSession(data)
            pendingTwoFactor.value = false
            return { twoFactorRequired: false }
        } catch (e: any) {
            console.error('Login error', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    /**
     * Complete two-factor authentication.
     *
     * Sends the TOTP code with the pre-auth token (stored in admin_preauth_token).
     * On success: revokes the pre-auth token (backend), stores the full admin token.
     */
    async function verifyTwoFactor(code: string): Promise<void> {
        loading.value = true
        try {
            // Temporarily swap in the pre-auth token for this request
            const preAuthToken = localStorage.getItem('admin_preauth_token')
            if (!preAuthToken) throw new Error('No pending two-factor session found.')

            // Temporarily set the pre-auth token so the interceptor attaches it
            localStorage.setItem('admin_token', preAuthToken)

            const response = await apiClient.post('/admin/auth/2fa/verify', { code })

            // Clear the pre-auth token — it was revoked on the backend
            localStorage.removeItem('admin_preauth_token')

            const data = response.data?.data
            _setSession(data)
            pendingTwoFactor.value = false
        } catch (e: any) {
            // Restore state on failure — remove the temporarily set token
            localStorage.removeItem('admin_token')
            token.value = null
            console.error('Two-factor verification error', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    /**
     * Revoke the current access token and clear local auth state.
     */
    async function logout() {
        try {
            await apiClient.post('/admin/auth/logout')
        } catch {
            // Ignore backend errors on logout — clear locally regardless
        } finally {
            token.value = null
            user.value = null
            pendingTwoFactor.value = false
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_preauth_token')
            localStorage.removeItem('admin_user')
        }
    }

    /**
     * Fetch and refresh the current admin's profile from the backend.
     * Replaces the previous mock implementation.
     */
    async function fetchUser() {
        if (!token.value) return
        try {
            const response = await apiClient.get('/admin/auth/me')
            const data = response.data?.data
            user.value = {
                id:          data.id,
                name:        data.name,
                email:       data.email,
                roles:       data.roles ?? [data.role].filter(Boolean),
                permissions: data.permissions ?? [],
            }
            localStorage.setItem('admin_user', JSON.stringify(user.value))
        } catch {
            await logout() // Token invalid — force re-login
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Persist the full-access session token and user data.
     */
    function _setSession(data: any) {
        const admin = data?.admin
        token.value = data?.token
        localStorage.setItem('admin_token', data?.token ?? '')

        if (admin) {
            user.value = {
                id:          admin.id,
                name:        admin.name,
                email:       admin.email,
                roles:       admin.roles ?? (admin.role ? [admin.role] : []),
                permissions: admin.permissions ?? [],
            }
            localStorage.setItem('admin_user', JSON.stringify(user.value))
        }
    }

    // Rehydrate user from localStorage on page load (avoids flicker)
    const cachedUser = localStorage.getItem('admin_user')
    if (cachedUser) {
        try { user.value = JSON.parse(cachedUser) } catch { /* ignore */ }
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
