<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, humanize, formatDate } from '../../utils/format'

const route        = useRoute()
const savingsStore = useSavingsStore()
const transactions = computed(() => savingsStore.transactions.data || [])
const txMeta       = computed(() => savingsStore.transactions.meta || {})
const loading      = computed(() => savingsStore.loading)
const error        = computed(() => savingsStore.error)

const filters = ref({
    page:         1,
    type:         '',
    product_code: '',
    vault_ref:    (route.query.vault_ref as string) || '',  // pre-filled from Audit Trail link
    date_from:    '',
    date_to:      '',
    direction:    '',
})

onMounted(() => fetchTransactions())

const fetchTransactions = () => savingsStore.fetchTransactions(filters.value)

const nextPage = () => {
    if (filters.value.page < (txMeta.value.last_page || 1)) {
        filters.value.page++
        fetchTransactions()
    }
}
const prevPage = () => {
    if (filters.value.page > 1) {
        filters.value.page--
        fetchTransactions()
    }
}

const statusColor = (status: string) => ({
    completed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    pending:   'text-amber-500 bg-amber-500/10 border-amber-500/20',
    failed:    'text-rose-500 bg-rose-500/10 border-rose-500/20',
}[status] || 'text-slate-500 bg-slate-500/10 border-slate-500/20')

const productColor: Record<string, string> = {
    blocflex:  'bg-blue-500/10 text-blue-500',
    bloclock:  'bg-emerald-500/10 text-emerald-500',
    blocgoal:  'bg-amber-500/10 text-amber-500',
    blocround: 'bg-purple-500/10 text-purple-500',
}

const typeIcon: Record<string, string> = {
    funding:         '📥',
    withdrawal:      '📤',
    interest:        '💹',
    maturity_payout: '🔓',
    round_up:        '🔄',
    penalty:         '⚠️',
}

const exportCSV = () => {
    const headers = ['Timestamp', 'Event', 'Product', 'Vault Ref', 'Direction', 'Amount', 'Balance After', 'Status']
    const rows    = transactions.value.map((tx: any) => [
        formatDate(tx.created_at),
        humanize(tx.type),
        tx.product_code,
        tx.vault_ref,
        tx.direction,
        tx.amount,
        tx.balance_after ?? '',
        tx.status,
    ])
    const csv  = [headers, ...rows].map(l => l.join(',')).join('\n')
    const link = document.createElement('a')
    link.href  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.setAttribute('download', `savings_log_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
</script>

<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex justify-between items-center flex-wrap gap-4">
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Savings Transactions</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Full audit trail of all savings events</p>
            </div>
            <button @click="exportCSV"
                class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-80 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export CSV
            </button>
        </div>

        <!-- Error state -->
        <div v-if="error" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
            ⚠️ {{ error }}
        </div>

        <!-- Filters -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</label>
                <select v-model="filters.product_code" @change="filters.page = 1; fetchTransactions()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">All</option>
                    <option value="blocflex">BlocFlex</option>
                    <option value="bloclock">BlocLock</option>
                    <option value="blocgoal">BlocGoal</option>
                    <option value="blocround">BlocRound</option>
                </select>
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Type</label>
                <select v-model="filters.type" @change="filters.page = 1; fetchTransactions()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">All Events</option>
                    <option value="funding">Funding</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="interest">Interest</option>
                    <option value="maturity_payout">Maturity</option>
                    <option value="round_up">Round-Up</option>
                    <option value="penalty">Penalty</option>
                </select>
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Direction</label>
                <select v-model="filters.direction" @change="filters.page = 1; fetchTransactions()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">Both</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vault Ref</label>
                <input v-model="filters.vault_ref" @input="filters.page = 1; fetchTransactions()"
                    placeholder="Search Ref..."
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black outline-none" />
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</label>
                <input type="date" v-model="filters.date_from" @change="filters.page = 1; fetchTransactions()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black outline-none" />
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</label>
                <input type="date" v-model="filters.date_to" @change="filters.page = 1; fetchTransactions()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black outline-none" />
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div v-if="loading" class="p-16 flex items-center justify-center">
                <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left min-w-[750px]">
                    <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <tr>
                            <th v-for="h in ['Timestamp', 'Event', 'Vault Ref', 'Product', 'Amount', 'Status']" :key="h"
                                class="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {{ h }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                        <tr v-for="tx in transactions" :key="tx.id"
                            class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td class="px-5 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">{{ formatDate(tx.created_at) }}</td>
                            <td class="px-5 py-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">{{ typeIcon[tx.type] || '💰' }}</span>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ humanize(tx.type) }}</p>
                                        <p class="text-[8px] font-black uppercase tracking-widest"
                                            :class="tx.direction === 'debit' ? 'text-rose-400' : 'text-emerald-400'">
                                            {{ tx.direction }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-4 font-mono text-[9px] font-bold text-indigo-500 whitespace-nowrap">{{ tx.vault_ref }}</td>
                            <td class="px-5 py-4">
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                    :class="productColor[tx.product_code] || 'bg-slate-500/10 text-slate-500'">
                                    {{ tx.product_code }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-right">
                                <span :class="['text-sm font-black', tx.direction === 'debit' ? 'text-rose-500' : 'text-emerald-500']">
                                    {{ tx.direction === 'debit' ? '−' : '+' }}{{ formatBalance(tx.amount) }}
                                </span>
                                <p v-if="tx.balance_after" class="text-[9px] text-slate-400 font-bold mt-0.5">
                                    Bal: {{ formatBalance(tx.balance_after) }}
                                </p>
                            </td>
                            <td class="px-5 py-4">
                                <span :class="['px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', statusColor(tx.status)]">
                                    {{ tx.status }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="transactions.length === 0">
                            <td colspan="6" class="px-6 py-20 text-center">
                                <div class="text-5xl opacity-20 mb-3">📋</div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No savings transactions found</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="txMeta.last_page > 1" class="px-5 py-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400">
                    Page {{ txMeta.current_page }} of {{ txMeta.last_page }}
                    <span v-if="txMeta.total" class="ml-2">({{ txMeta.total?.toLocaleString() }} records)</span>
                </span>
                <div class="flex gap-2">
                    <button @click="prevPage" :disabled="filters.page <= 1"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        ← Prev
                    </button>
                    <button @click="nextPage" :disabled="filters.page >= (txMeta.last_page || 1)"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 hover:opacity-80 transition-opacity">
                        Next →
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
