import apiClient from './axios'

/**
 * Pricing / SystemConfig Admin API wrapper.
 * Interacts with /admin/config/* endpoints.
 */
export const configApi = {
    /**
     * GET /admin/config — fetch all system config keys.
     * Pass a group prefix to filter: getConfigs('fee') returns fee.* keys.
     */
    getConfigs(group?: string) {
        return apiClient.get('/admin/config', {
            params: group ? { group } : {}
        })
    },

    /**
     * PUT /admin/config/{key} — update a single config value.
     */
    updateConfig(key: string, value: string | number | boolean) {
        return apiClient.put(`/admin/config/${encodeURIComponent(key)}`, { value: String(value) })
    },

    /**
     * POST /admin/config — create a new config key.
     */
    createConfig(data: {
        key: string
        value: string | number | boolean
        type?: string
        description?: string
        is_encrypted?: boolean
    }) {
        return apiClient.post('/admin/config', {
            ...data,
            value: String(data.value),
        })
    },

    /**
     * POST /admin/config/flush-cache — bust Redis cache for all pricing keys.
     */
    flushPricingCache() {
        return apiClient.post('/admin/config/flush-cache')
    },
}
