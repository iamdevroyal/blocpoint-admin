<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, humanize, formatDate } from '../../utils/format'

const savingsStore = useSavingsStore()
const transactions = computed(() => savingsStore.transactions.data || [])
const loading = computed(() => savingsStore.loading)

const filters = ref({
    page: 1,
    type: '',
    product_code: '',
    vault_ref: '',
    date_from: '',
    date_to: ''
})

onMounted(() => {
    fetchTransactions()
})

const fetchTransactions = () => {
    savingsStore.fetchTransactions(filters.value)
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'text-emerald-500 bg-emerald-500/10'
        case 'pending': return 'text-amber-500 bg-amber-500/10'
        case 'failed': return 'text-rose-500 bg-rose-500/10'
        default: return 'text-slate-500 bg-slate-500/10'
    }
}

const exportCSV = () => {
    const headers = ['Timestamp', 'Event', 'Vault Ref', 'Product', 'Amount', 'Status']
    const data = transactions.value.map((tx: any) => [
        formatDate(tx.created_at),
        humanize(tx.type),
        tx.vault_ref,
        tx.product_code,
        tx.amount,
        tx.status
    ])
    
    const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `savings_log_${new Date().toISOString().slice(0,10)}.csv`)
    link.click()
}
</script>

<template>
    <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Savings Transactions</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit trail of all savings events</p>
            </div>
            <button @click="exportCSV" class="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-200 dark:border-white/10 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl">
                📥 Export CSV
            </button>
        </div>

        <!-- Filters -->
        <div class="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div class="space-y-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Product</label>
                <select v-model="filters.product_code" @change="fetchTransactions" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option value="">All Products</option>
                    <option value="blocflex">BlocFlex</option>
                    <option value="bloclock">BlocLock</option>
                    <option value="blocgoal">BlocGoal</option>
                    <option value="blocround">BlocRound</option>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Event Type</label>
                <select v-model="filters.type" @change="fetchTransactions" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option value="">All Events</option>
                    <option value="funding">Funding</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="interest_credit">Interest Credit</option>
                    <option value="maturity_payout">Maturity Payout</option>
                    <option value="penalty">Penalty</option>
                </select>
            </div>
            <div class="space-y-2 lg:col-span-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Vault Ref</label>
                <input v-model="filters.vault_ref" @input="fetchTransactions" placeholder="Search Ref..." class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none" />
            </div>
            <div class="space-y-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">From Date</label>
                <input type="date" v-model="filters.date_from" @change="fetchTransactions" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none" />
            </div>
            <div class="space-y-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">To Date</label>
                <input type="date" v-model="filters.date_to" @change="fetchTransactions" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none" />
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Ref</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{{ formatDate(tx.created_at) }}</td>
                        <td class="px-6 py-4">
                            <p class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ humanize(tx.type) }}</p>
                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">{{ tx.product_code }}</span>
                        </td>
                        <td class="px-6 py-4 font-mono text-[10px] font-bold text-indigo-500">{{ tx.vault_ref }}</td>
                        <td class="px-6 py-4 text-right">
                            <span :class="['text-xs font-black', tx.direction === 'debit' ? 'text-rose-500' : 'text-emerald-500']">
                                {{ tx.direction === 'debit' ? '-' : '+' }}{{ formatBalance(tx.amount) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span :class="['px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest', getStatusColor(tx.status)]">
                                {{ tx.status }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="transactions.length === 0 && !loading">
                        <td colspan="5" class="px-6 py-20 text-center">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No transactions logged</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
