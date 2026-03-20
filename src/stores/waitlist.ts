import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
    getWaitlist,
    updateWaitlistEntry,
    deleteWaitlistEntry,
    type WaitlistEntry,
    type WaitlistFilters,
} from '../api/waitlist'

/**
 * Pinia store for the admin waitlist management page.
 */
export const useWaitlistStore = defineStore('waitlist', () => {
    // ─── State ───────────────────────────────────────────────────────
    const entries = ref<WaitlistEntry[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = reactive({
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
    })
    const filters = reactive<WaitlistFilters>({
        search: '',
        status: '',
        platform: '',
        role: '',
        per_page: 25,
    })

    // ─── Actions ─────────────────────────────────────────────────────

    /**
     * Fetch the paginated waitlist from the backend.
     *
     * @param  page  Page number (defaults to 1)
     */
    async function fetchWaitlist(page = 1): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const params: WaitlistFilters = { ...filters, page, per_page: pagination.perPage }

            // Strip empty filter values so the backend doesn't apply them
            Object.keys(params).forEach((k) => {
                const key = k as keyof WaitlistFilters
                if (params[key] === '' || params[key] === undefined) {
                    delete params[key]
                }
            })

            const response = await getWaitlist(params)
            const result = response.data.data
            entries.value = result.data
            pagination.currentPage = result.current_page
            pagination.lastPage = result.last_page
            pagination.perPage = result.per_page
            pagination.total = result.total
        } catch (err: any) {
            error.value = err.response?.data?.message ?? 'Failed to fetch waitlist.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Update the status of one waitlist entry.
     *
     * @param  id      Waitlist entry UUID
     * @param  status  New status
     */
    async function updateStatus(id: string, status: string): Promise<void> {
        try {
            const response = await updateWaitlistEntry(id, status)
            const updated = response.data.data
            const index = entries.value.findIndex((e) => e.id === id)
            if (index !== -1) {
                entries.value[index] = updated
            }
        } catch (err: any) {
            error.value = err.response?.data?.message ?? 'Failed to update status.'
            throw err
        }
    }

    /**
     * Delete a waitlist entry and remove it from the local list.
     *
     * @param  id  Waitlist entry UUID
     */
    async function deleteEntry(id: string): Promise<void> {
        try {
            await deleteWaitlistEntry(id)
            entries.value = entries.value.filter((e) => e.id !== id)
            pagination.total = Math.max(0, pagination.total - 1)
        } catch (err: any) {
            error.value = err.response?.data?.message ?? 'Failed to delete entry.'
            throw err
        }
    }

    /**
     * Reset filters to defaults and re-fetch.
     */
    async function resetFilters(): Promise<void> {
        filters.search = ''
        filters.status = ''
        filters.platform = ''
        filters.role = ''
        await fetchWaitlist(1)
    }

    /**
     * Export the current waitlist page as a CSV file.
     */
    function exportCsv(): void {
        const headers = ['Email', 'Full Name', 'Platform', 'Role', 'Status', 'Joined At']
        const rows = entries.value.map((e) => [
            e.email,
            e.full_name ?? '',
            e.platform,
            e.role,
            e.status,
            new Date(e.created_at).toLocaleDateString(),
        ])

        const csvContent = [headers, ...rows]
            .map((row) => row.map((v) => `"${v}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return {
        entries,
        loading,
        error,
        pagination,
        filters,
        fetchWaitlist,
        updateStatus,
        deleteEntry,
        resetFilters,
        exportCsv,
    }
})
