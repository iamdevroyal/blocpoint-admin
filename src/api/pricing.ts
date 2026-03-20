import apiClient from './axios'

/**
 * Pricing / SystemConfig Admin API wrapper.
 * Interacts with /admin/config/* endpoints.
 */
export const configApi = {
    /**
     * Get config variables, filtered optionally by group.
     */
    getConfig(group?: string) {
        return apiClient.get('/admin/config', {
            params: { group }
        })
    },

    /**
     * Update an existing config entry.
     */
    updateConfig(key: string, value: string | number | boolean) {
        return apiClient.put(`/admin/config/${encodeURIComponent(key)}`, { value: String(value) })
    },

    /**
     * POST /admin/config — create a brand-new config key.
     */
    createConfig(key: string, value: string | number | boolean, type: string = 'string', group: string = 'general', description: string = '') {
        return apiClient.post('/admin/config', {
            key,
            value: String(value),
            type,
            group,
            description
        })
    },

    /**
     * Clear dynamic pricing config cache to force refresh across fleet.
     */
    flushCache() {
        return apiClient.post('/admin/config/flush-cache')
    },
}
