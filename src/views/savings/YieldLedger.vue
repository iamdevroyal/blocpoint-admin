<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, formatDate } from '../../utils/format'

const savingsStore = useSavingsStore()
const yieldData    = computed(() => savingsStore.yieldLedger.data || [])
const yieldMeta    = computed(() => savingsStore.yieldLedger.meta || {})
const loading      = computed(() => savingsStore.loading)
const error        = computed(() => savingsStore.error)

const filters = ref({
    page:         1,
    product_code: '',
    date_from:    '',
    date_to:      '',
})

onMounted(() => fetchYield())

const fetchYield = () => savingsStore.fetchYieldLedger(filters.value)

const nextPage = () => {
    if (filters.value.page < (yieldMeta.value.last_page || 1)) {
        filters.value.page++
        fetchYield()
    }
}
const prevPage = () => {
    if (filters.value.page > 1) {
        filters.value.page--
        fetchYield()
    }
}

// DB columns: allocated | reconciled
const statusColor = (status: string) => ({
    allocated:   'text-amber-500 bg-amber-500/10 border border-amber-500/20',
    reconciled:  'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20',
}[status] || 'text-slate-500 bg-slate-500/10 border border-slate-500/20')

const productColor: Record<string, string> = {
    blocflex:  'bg-blue-500/10 text-blue-500',
    bloclock:  'bg-emerald-500/10 text-emerald-500',
    blocgoal:  'bg-amber-500/10 text-amber-500',
    blocround: 'bg-purple-500/10 text-purple-500',
}

// DB columns: gross_yield, user_yield, platform_spread
const totalGrossYield    = computed(() => yieldData.value.reduce((s: number, r: any) => s + parseFloat(r.gross_yield    || 0), 0))
const totalUserYield     = computed(() => yieldData.value.reduce((s: number, r: any) => s + parseFloat(r.user_yield     || 0), 0))
const totalSpread        = computed(() => yieldData.value.reduce((s: number, r: any) => s + parseFloat(r.platform_spread || 0), 0))

const exportCSV = () => {
    const headers = ['Date', 'Product', 'Provider Ref', 'Gross Yield', 'User Yield', 'Platform Spread', 'Status']
    const rows = yieldData.value.map((r: any) => [
        formatDate(r.allocation_date),
        r.product_code,
        r.provider_ref ?? '',
        r.gross_yield,
        r.user_yield,
        r.platform_spread,
        r.status,
    ])
    const csv  = [headers, ...rows].map(l => l.join(',')).join('\n')
    const link = document.createElement('a')
    link.href  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.setAttribute('download', `yield_ledger_${Date.now()}.csv`)
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
                <h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Yield Ledger</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Treasury spread &amp; distributed interest records</p>
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

        <!-- KPI Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="card in [
                { label: 'Gross Yield (Page)',  value: formatBalance(totalGrossYield),  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Total User Yield',    value: formatBalance(totalUserYield),   color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
                { label: 'Platform Spread',     value: formatBalance(totalSpread),       color: 'text-purple-500',  bg: 'bg-purple-500/10'  },
            ]" :key="card.label"
                class="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" :class="card.bg">💹</div>
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ card.label }}</p>
                    <p class="text-xl font-black" :class="card.color">{{ card.value }}</p>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</label>
                <select v-model="filters.product_code" @change="filters.page = 1; fetchYield()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">All Products</option>
                    <option value="blocflex">BlocFlex</option>
                    <option value="bloclock">BlocLock</option>
                    <option value="blocgoal">BlocGoal</option>
                    <option value="blocround">BlocRound</option>
                </select>
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</label>
                <input type="date" v-model="filters.date_from" @change="filters.page = 1; fetchYield()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black outline-none" />
            </div>
            <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</label>
                <input type="date" v-model="filters.date_to" @change="filters.page = 1; fetchYield()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black outline-none" />
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
            <div v-if="loading" class="p-16 flex items-center justify-center">
                <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[700px]">
                    <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <tr>
                            <th v-for="h in ['Date', 'Product', 'Provider Ref', 'Gross Yield', 'User Yield', 'Platform Spread', 'Status']"
                                :key="h"
                                class="text-left px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {{ h }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                        <tr v-if="yieldData.length === 0">
                            <td colspan="7" class="px-6 py-20 text-center">
                                <div class="text-5xl opacity-20 mb-3">💹</div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No yield records found for selected filters</p>
                            </td>
                        </tr>
                        <tr v-for="row in yieldData" :key="row.id"
                            class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <!-- allocation_date is the correct DB column -->
                            <td class="px-5 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">{{ formatDate(row.allocation_date) }}</td>
                            <td class="px-5 py-4">
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                    :class="productColor[row.product_code] || 'bg-slate-500/10 text-slate-500'">
                                    {{ row.product_code }}
                                </span>
                            </td>
                            <td class="px-5 py-4 font-mono text-[9px] font-bold text-indigo-500 dark:text-indigo-400">{{ row.provider_ref || '—' }}</td>
                            <td class="px-5 py-4 text-sm font-black text-slate-800 dark:text-white">{{ formatBalance(row.gross_yield) }}</td>
                            <!-- user_yield is the correct DB column (agent's share) -->
                            <td class="px-5 py-4 text-sm font-black text-emerald-600 dark:text-emerald-400">{{ formatBalance(row.user_yield) }}</td>
                            <!-- platform_spread is the correct DB column -->
                            <td class="px-5 py-4 text-sm font-black text-purple-600 dark:text-purple-400">{{ formatBalance(row.platform_spread) }}</td>
                            <td class="px-5 py-4">
                                <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" :class="statusColor(row.status)">
                                    {{ row.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="yieldMeta.last_page > 1" class="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400">
                    Page {{ yieldMeta.current_page }} of {{ yieldMeta.last_page }}
                    <span v-if="yieldMeta.total" class="ml-2">({{ yieldMeta.total?.toLocaleString() }} records)</span>
                </span>
                <div class="flex gap-2">
                    <button @click="prevPage" :disabled="filters.page <= 1"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        ← Prev
                    </button>
                    <button @click="nextPage" :disabled="filters.page >= (yieldMeta.last_page || 1)"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 hover:opacity-80 transition-opacity">
                        Next →
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
