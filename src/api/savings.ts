import apiClient from './axios'

/**
 * Savings Admin API wrapper.
 * Interacts with /admin/savings/* endpoints.
 */
export default {
    /** GET /admin/savings/dashboard — aggregated KPIs */
    getDashboardStats() {
        return apiClient.get('/admin/savings/dashboard')
    },

    /** GET /admin/savings/products — all savings product configs */
    getProducts() {
        return apiClient.get('/admin/savings/products')
    },

    /** PUT /admin/savings/products/{code} — update rate or status */
    updateProduct(code: string, data: any) {
        return apiClient.put(`/admin/savings/products/${code}`, data)
    },

    /** GET /admin/savings/vaults — paginated vault list with filters */
    getVaults(params = {}) {
        return apiClient.get('/admin/savings/vaults', { params })
    },

    /**
     * POST /admin/savings/vaults/{vaultRef}/freeze
     * Freezes a vault to block all savings operations (compliance hold).
     */
    freezeVault(vaultRef: string) {
        return apiClient.post(`/admin/savings/vaults/${vaultRef}/freeze`)
    },

    /**
     * POST /admin/savings/vaults/{vaultRef}/unfreeze
     * Restores a frozen vault back to active status.
     */
    unfreezeVault(vaultRef: string) {
        return apiClient.post(`/admin/savings/vaults/${vaultRef}/unfreeze`)
    },

    /** GET /admin/savings/transactions — paginated savings transaction log */
    getTransactions(params?: Record<string, any>) {
        return apiClient.get('/admin/savings/transactions', { params })
    },

    /** GET /admin/savings/yield-ledger — treasury yield allocation records */
    getYieldLedgerLogs(params?: Record<string, any>) {
        return apiClient.get('/admin/savings/yield-ledger', { params })
    }
}
