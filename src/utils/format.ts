/**
 * Format a number as currency (NGN)
 */
export function formatBalance(amount: number | string | null, symbol: string = '₦'): string {
    if (amount === null || amount === undefined) return `${symbol}0.00`
    const val = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${symbol}${val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Humanize a snake_case string
 */
export function humanize(str: string): string {
    return str
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
