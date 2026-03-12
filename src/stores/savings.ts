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

    async function fetchDashboardStats() {
        loading.value = true
        try {
            const { data } = await savingsApi.getDashboardStats()
            dashboardStats.value = data.data
        } finally {
            loading.value = false
        }
    }

    async function fetchProducts() {
        loading.value = true
        try {
            const { data } = await savingsApi.getProducts()
            products.value = data.data
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(code: string, payload: any) {
        loading.value = true
        try {
            await savingsApi.updateProduct(code, payload)
            await fetchProducts()
        } finally {
            loading.value = false
        }
    }

    async function fetchVaults(params = {}) {
        loading.value = true
        try {
            const { data } = await savingsApi.getVaults(params)
            vaults.value = data
        } finally {
            loading.value = false
        }
    }

    async function fetchTransactions(params = {}) {
        loading.value = true
        try {
            const { data } = await savingsApi.getTransactions(params)
            transactions.value = data
        } finally {
            loading.value = false
        }
    }

    async function fetchYieldLedger(params = {}) {
        loading.value = true
        try {
            const { data } = await savingsApi.getYieldLedger(params)
            yieldLedger.value = data
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
        fetchDashboardStats,
        fetchProducts,
        updateProduct,
        fetchVaults,
        fetchTransactions,
        fetchYieldLedger
    }
})
