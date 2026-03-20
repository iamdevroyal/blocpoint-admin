import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pricingApi from '../api/pricing'

export interface SystemConfig {
    id: string
    key: string
    value: any
    type: string
    description: string | null
    is_encrypted: boolean
    updated_by: string | null
    updated_at: string
}

/**
 * Pricing Store — manages SystemConfig data for the admin Pricing Engine page.
 *
 * Organises flat key/value list into groups by key prefix:
 *   fee.*        → feeConfigs
 *   rate.*       → rateConfigs
 *   tax.*        → taxConfigs
 *   commission.* → commissionConfigs
 *   stablecoin.* → stablecoinConfigs
 *   lending.*    → lendingConfigs
 *   virtualcard.*→ virtualCardConfigs
 */
export const usePricingStore = defineStore('pricing', () => {
    const configs = ref<SystemConfig[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const publishing = ref(false)
    const error = ref<string | null>(null)

    // ─── Computed Groupings ────────────────────────────────────────────────────
    const feeConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('fee.'))
    )
    const rateConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('rate.'))
    )
    const taxConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('tax.'))
    )
    const commissionConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('commission.'))
    )
    const stablecoinConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('stablecoin.'))
    )
    const lendingConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('lending.'))
    )
    const virtualCardConfigs = computed(() =>
        configs.value.filter(c => c.key.startsWith('virtualcard.'))
    )

    // ─── Actions ───────────────────────────────────────────────────────────────

    /**
     * Fetch all pricing-related config keys from backend.
     * Loads all groups in a single call (no group filter).
     */
    async function fetchAll() {
        loading.value = true
        error.value = null
        try {
            const res = await pricingApi.getConfigs()
            // Filter to only pricing-relevant prefixes to exclude system/auth keys
            const pricingPrefixes = ['fee.', 'rate.', 'tax.', 'commission.', 'stablecoin.', 'lending.', 'virtualcard.']
            configs.value = (res.data?.data ?? []).filter((c: SystemConfig) =>
                pricingPrefixes.some(p => c.key.startsWith(p))
            )
        } catch (err: any) {
            error.value = err?.response?.data?.message ?? 'Failed to load pricing config.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Update a single config key value.
     * Optimistically updates the local list, reverts on failure.
     */
    async function updateConfig(key: string, value: string | number): Promise<boolean> {
        saving.value = true
        error.value = null
        // Optimistic update
        const original = configs.value.find(c => c.key === key)
        if (original) original.value = value
        try {
            const res = await pricingApi.updateConfig(key, value)
            // Sync with server response
            const updated = res.data?.data
            if (updated) {
                const idx = configs.value.findIndex(c => c.key === key)
                if (idx !== -1) configs.value[idx] = updated
            }
            return true
        } catch (err: any) {
            // Revert optimistic update
            if (original) await fetchAll()
            error.value = err?.response?.data?.message ?? 'Failed to update config.'
            return false
        } finally {
            saving.value = false
        }
    }

    /**
     * Create a brand-new config key.
     */
    async function createConfig(data: {
        key: string
        value: string | number
        type?: string
        description?: string
    }): Promise<boolean> {
        saving.value = true
        error.value = null
        try {
            const res = await pricingApi.createConfig(data)
            configs.value.push(res.data?.data)
            return true
        } catch (err: any) {
            error.value = err?.response?.data?.message
                ?? err?.response?.data?.errors?.key?.[0]
                ?? 'Failed to create config key.'
            return false
        } finally {
            saving.value = false
        }
    }

    /**
     * Flush Redis cache for all pricing config keys (Publish Changes).
     */
    async function flushCache(): Promise<boolean> {
        publishing.value = true
        error.value = null
        try {
            await pricingApi.flushPricingCache()
            return true
        } catch (err: any) {
            error.value = err?.response?.data?.message ?? 'Failed to publish changes.'
            return false
        } finally {
            publishing.value = false
        }
    }

    return {
        configs,
        loading,
        saving,
        publishing,
        error,
        feeConfigs,
        rateConfigs,
        taxConfigs,
        commissionConfigs,
        stablecoinConfigs,
        lendingConfigs,
        virtualCardConfigs,
        fetchAll,
        updateConfig,
        createConfig,
        flushCache,
    }
})
