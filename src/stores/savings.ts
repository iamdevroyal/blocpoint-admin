import { defineStore } from 'pinia'
import { ref } from 'vue'
import savingsApi from '../api/savings'

export const useSavingsStore = defineStore('savings', () => {
    const dashboardStats = ref<any>(null)
    const products = ref<any[]>([])
    const vaults = ref<any>({ data: [], meta: {} })
    const transactions = ref<any>({ data: [], meta: {} })
    const yieldLedger = ref<any>({ data: [], meta: {} })
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchDashboardStats() {
        loading.value = true
        error.value = null
        try {
            const { data } = await savingsApi.getDashboardStats()
            dashboardStats.value = data.data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to load dashboard stats'
        } finally {
            loading.value = false
        }
    }

    async function fetchProducts() {
        loading.value = true
        error.value = null
        try {
            const { data } = await savingsApi.getProducts()
            products.value = data.data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to load products'
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(code: string, payload: any) {
        loading.value = true
        error.value = null
        try {
            await savingsApi.updateProduct(code, payload)
            await fetchProducts()
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to update product'
            throw e  // re-throw so the component can react
        } finally {
            loading.value = false
        }
    }

    async function fetchVaults(params = {}) {
        loading.value = true
        error.value = null
        try {
            const { data } = await savingsApi.getVaults(params)
            vaults.value = data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to load vaults'
        } finally {
            loading.value = false
        }
    }

    /**
     * Freeze a savings vault (compliance hold).
     * Optimistically updates the local vault status and refreshes the list.
     */
    async function freezeVault(vaultRef: string) {
        error.value = null
        try {
            const { data } = await savingsApi.freezeVault(vaultRef)
            // Update vault in local list
            const idx = vaults.value.data?.findIndex((v: any) => v.vault_ref === vaultRef)
            if (idx >= 0) vaults.value.data[idx] = data.data
            return data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to freeze vault'
            throw e
        }
    }

    /**
     * Unfreeze a savings vault (restore to active).
     */
    async function unfreezeVault(vaultRef: string) {
        error.value = null
        try {
            const { data } = await savingsApi.unfreezeVault(vaultRef)
            const idx = vaults.value.data?.findIndex((v: any) => v.vault_ref === vaultRef)
            if (idx >= 0) vaults.value.data[idx] = data.data
            return data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to unfreeze vault'
            throw e
        }
    }

    async function fetchTransactions(params = {}) {
        loading.value = true
        error.value = null
        try {
            const { data } = await savingsApi.getTransactions(params)
            transactions.value = data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to load transactions'
        } finally {
            loading.value = false
        }
    }

    async function fetchYieldLedger(params = {}) {
        loading.value = true
        error.value = null
        try {
            const { data } = await savingsApi.getYieldLedger(params)
            yieldLedger.value = data
        } catch (e: any) {
            error.value = e.response?.data?.message ?? 'Failed to load yield ledger'
        } finally {
            loading.value = false
        }
    }

    return {
        dashboardStats,
        products,
        vaults,
        transactions,
        yieldLedger,
        loading,
        error,
        fetchDashboardStats,
        fetchProducts,
        updateProduct,
        fetchVaults,
        freezeVault,
        unfreezeVault,
        fetchTransactions,
        fetchYieldLedger,
    }
})
