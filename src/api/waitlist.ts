import apiClient from './axios'

/**
 * Waitlist API module for blocpoint-admin.
 *
 * All routes require auth:admin middleware (handled by the Axios interceptor).
 */

export interface WaitlistEntry {
    id: string
    email: string
    full_name: string | null
    platform: 'web' | 'ios' | 'android'
    role: 'user' | 'agent'
    status: 'pending' | 'contacted' | 'invited' | 'rejected'
    created_at: string
    updated_at: string
}

export interface WaitlistFilters {
    search?: string
    status?: string
    platform?: string
    role?: string
    per_page?: number
    page?: number
}

export interface PaginatedWaitlist {
    data: WaitlistEntry[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

/**
 * Fetch a paginated list of waitlist entries with optional filters.
 *
 * @param  filters  Query parameters to filter/paginate
 * @returns Paginated waitlist response
 */
export const getWaitlist = (filters: WaitlistFilters = {}): Promise<{ data: { data: PaginatedWaitlist } }> => {
    return apiClient.get('/admin/waitlist', { params: filters })
}

/**
 * Update the status of a waitlist entry.
 *
 * @param  id      Waitlist entry UUID
 * @param  status  New status: pending | contacted | invited | rejected
 * @returns Updated waitlist entry
 */
export const updateWaitlistEntry = (id: string, status: string): Promise<{ data: { data: WaitlistEntry } }> => {
    return apiClient.patch(`/admin/waitlist/${id}`, { status })
}

/**
 * Delete a waitlist entry permanently.
 *
 * @param  id  Waitlist entry UUID
 */
export const deleteWaitlistEntry = (id: string): Promise<void> => {
    return apiClient.delete(`/admin/waitlist/${id}`)
}
