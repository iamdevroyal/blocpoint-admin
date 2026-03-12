import apiClient from './axios'

/**
 * Savings Admin API wrapper.
 * Interacts with /admin/savings/* endpoints.
 */
export default {
    /**
     * Get savings dashboard statistics (AUM, Active Users, Interest Paid, etc.)
     */
    getDashboardStats() {
        return apiClient.get('/api/v1/admin/savings/dashboard')
    },

    /**
     * Get all savings products with their configurations.
     */
    getProducts() {
        return apiClient.get('/api/v1/admin/savings/products')
    },

    /**
     * Update a specific savings product config (rate, status).
     */
    updateProduct(code: string, data: any) {
        return apiClient.put(`/api/v1/admin/savings/products/${code}`, data)
    },

    /**
     * Get a paginated list of all savings vaults.
     */
    getVaults(params = {}) {
        return apiClient.get('/api/v1/admin/savings/vaults', { params })
    },

    /**
     * Get a paginated list of all savings transactions.
     */
    getTransactions(params = {}) {
        return apiClient.get('/api/v1/admin/savings/transactions', { params })
    },

    /**
     * Get yield ledger records (gross yield vs distributed interest).
     */
    getYieldLedger(params = {}) {
        return apiClient.get('/api/v1/admin/savings/yield-ledger', { params })
    }
}
