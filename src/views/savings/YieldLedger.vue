<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, formatDate } from '../../utils/format'

const savingsStore = useSavingsStore()
const records = computed(() => savingsStore.yieldLedger.data || [])
const loading = computed(() => savingsStore.loading)

onMounted(() => {
    savingsStore.fetchYieldLedger()
})
</script>

<template>
    <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Yield Ledger</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Treasury Spread & Interest Distribution</p>
            </div>
        </div>

        <!-- Analytics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Yield (Treasury)</p>
                <p class="text-2xl font-black text-emerald-500">{{ formatBalance(0) }}</p>
            </div>
            <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distributed Interest</p>
                <p class="text-2xl font-black text-indigo-500">{{ formatBalance(0) }}</p>
            </div>
            <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Spread</p>
                <p class="text-2xl font-black text-amber-500">{{ formatBalance(0) }}</p>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
            <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Yield</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distributed</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Spread</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    <tr v-for="record in records" :key="record.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{{ formatDate(record.date) }}</td>
                        <td class="px-6 py-4 text-xs font-black text-slate-800 dark:text-white">{{ formatBalance(record.gross_yield) }}</td>
                        <td class="px-6 py-4 text-xs font-black text-indigo-500">{{ formatBalance(record.distributed_interest) }}</td>
                        <td class="px-6 py-4 text-xs font-black text-emerald-500">{{ formatBalance(record.spread) }}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">SETTLED</span>
                        </td>
                    </tr>
                    <tr v-if="records.length === 0 && !loading">
                        <td colspan="5" class="px-6 py-20 text-center">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No ledger records generated</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
