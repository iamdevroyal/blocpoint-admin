<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance } from '../../utils/format'
import { ArrowUpRight } from 'lucide-vue-next'

const savingsStore = useSavingsStore()
const vaults = computed(() => savingsStore.vaults.data || [])
const loading = computed(() => savingsStore.loading)

const filters = ref({
    page: 1,
    product_code: '',
    status: '',
    agent_id: ''
})

onMounted(() => {
    fetchVaults()
})

const fetchVaults = () => {
    savingsStore.fetchVaults(filters.value)
}

const productIcons: Record<string, { icon: string, color: string }> = {
    blocflex: { icon: '💧', color: 'bg-blue-500/10 text-blue-500' },
    bloclock: { icon: '🔒', color: 'bg-emerald-500/10 text-emerald-500' },
    blocgoal: { icon: '🎯', color: 'bg-amber-500/10 text-amber-500' },
    blocround: { icon: '🔄', color: 'bg-purple-500/10 text-purple-500' }
}
</script>

<template>
    <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Savings Registry</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Holistic view of user vaults & balances</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Suite</label>
                <select v-model="filters.product_code" @change="fetchVaults" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option value="">All Products</option>
                    <option value="blocflex">BlocFlex</option>
                    <option value="bloclock">BlocLock</option>
                    <option value="blocgoal">BlocGoal</option>
                    <option value="blocround">BlocRound</option>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vault Status</label>
                <select v-model="filters.status" @change="fetchVaults" class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner Identity</label>
                <input v-model="filters.agent_id" @input="fetchVaults" placeholder="Agent ID or Ref..." class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none" />
            </div>
        </div>

        <!-- Desktop Table view -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <tr>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Reference</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Detail</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Position</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    <tr v-for="vault in vaults" :key="vault.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6">
                            <div class="flex items-center gap-4">
                                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110', productIcons[vault.product_code]?.color]">
                                    {{ productIcons[vault.product_code]?.icon || '💰' }}
                                </div>
                                <span class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ vault.product_code }}</span>
                            </div>
                        </td>
                        <td class="px-8 py-6 font-mono text-[10px] font-bold text-slate-500">{{ vault.vault_ref }}</td>
                        <td class="px-8 py-6">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-bold text-indigo-500 font-mono">{{ vault.agent_id.split('-')[0] }}...</span>
                                <router-link :to="`/agents/${vault.agent_id}`" class="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                    <ArrowUpRight class="w-3 h-3 text-slate-400" />
                                </router-link>
                            </div>
                        </td>
                        <td class="px-8 py-6 text-right">
                            <p class="text-[13px] font-black text-slate-800 dark:text-white">{{ formatBalance(vault.available_balance) }}</p>
                            <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">+{{ formatBalance(vault.accrued_interest) }} Yield</p>
                        </td>
                        <td class="px-8 py-6">
                            <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', 
                                vault.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            ]">{{ vault.status }}</span>
                        </td>
                        <td class="px-8 py-6">
                            <button class="px-4 py-2 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all">Audit Trail</button>
                        </td>
                    </tr>
                    <tr v-if="vaults.length === 0 && !loading">
                        <td colspan="6" class="px-8 py-24 text-center space-y-4">
                            <div class="text-5xl opacity-20">🔎</div>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No active vaults discovered</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
