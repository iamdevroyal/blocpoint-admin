<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance } from '../../utils/format'
import { ArrowUpRight } from 'lucide-vue-next'

const savingsStore = useSavingsStore()
const router       = useRouter()
const vaults    = computed(() => savingsStore.vaults.data || [])
const vaultMeta = computed(() => savingsStore.vaults.meta || {})
const loading   = computed(() => savingsStore.loading)
const error     = computed(() => savingsStore.error)

const filters = ref({
    page:         1,
    product_code: '',
    status:       '',
    agent_id:     '',
})

// Toast notification
const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3500)
}

onMounted(() => fetchVaults())

const fetchVaults = () => savingsStore.fetchVaults(filters.value)

const nextPage = () => {
    if (filters.value.page < (vaultMeta.value.last_page || 1)) {
        filters.value.page++
        fetchVaults()
    }
}
const prevPage = () => {
    if (filters.value.page > 1) {
        filters.value.page--
        fetchVaults()
    }
}

/** Navigate to SavingsTransactions with vault_ref pre-filled as filter */
const openAuditTrail = (vault: any) => {
    router.push({ name: 'savings transactions', query: { vault_ref: vault.vault_ref } })
}

const toggleFreeze = async (vault: any) => {
    try {
        if (vault.status === 'frozen') {
            const res = await savingsStore.unfreezeVault(vault.vault_ref)
            showToast(res.message || `Vault ${vault.vault_ref} unfrozen.`, 'success')
        } else {
            const res = await savingsStore.freezeVault(vault.vault_ref)
            showToast(res.message || `Vault ${vault.vault_ref} frozen.`, 'success')
        }
    } catch (err: any) {
        showToast(err.response?.data?.message || 'Action failed.', 'error')
    }
}

const productMeta: Record<string, { icon: string; color: string }> = {
    blocflex:  { icon: '💧', color: 'bg-blue-500/10 text-blue-500' },
    bloclock:  { icon: '🔒', color: 'bg-emerald-500/10 text-emerald-500' },
    blocgoal:  { icon: '🎯', color: 'bg-amber-500/10 text-amber-500' },
    blocround: { icon: '🔄', color: 'bg-purple-500/10 text-purple-500' },
}

const statusColor = (status: string) => ({
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    frozen: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    closed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
}[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20')
</script>

<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex justify-between items-center flex-wrap gap-4">
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Savings Registry</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Holistic view of user vaults &amp; balances</p>
            </div>
            <div v-if="vaultMeta.total" class="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {{ vaultMeta.total?.toLocaleString() }} Total Vaults
            </div>
        </div>

        <!-- Error state -->
        <div v-if="error" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
            ⚠️ {{ error }}
        </div>

        <!-- Filters -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Suite</label>
                <select v-model="filters.product_code" @change="filters.page = 1; fetchVaults()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">All Products</option>
                    <option value="blocflex">BlocFlex</option>
                    <option value="bloclock">BlocLock</option>
                    <option value="blocgoal">BlocGoal</option>
                    <option value="blocround">BlocRound</option>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vault Status</label>
                <select v-model="filters.status" @change="filters.page = 1; fetchVaults()"
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Owner Identity</label>
                <input v-model="filters.agent_id" @input="filters.page = 1; fetchVaults()"
                    placeholder="Agent ID or Ref..."
                    class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none" />
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
            <div v-if="loading" class="p-16 flex items-center justify-center">
                <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <tr>
                            <th v-for="h in ['Product', 'Vault Reference', 'Agent', 'Balance / Yield', 'Status', 'Actions']" :key="h"
                                class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {{ h }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                        <tr v-for="vault in vaults" :key="vault.id"
                            class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                            <td class="px-6 py-5">
                                <div class="flex items-center gap-3">
                                    <div :class="['w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110', productMeta[vault.product_code]?.color || 'bg-slate-100 dark:bg-white/10']">
                                        {{ productMeta[vault.product_code]?.icon || '💰' }}
                                    </div>
                                    <span class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ vault.product_code }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-5 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">{{ vault.vault_ref }}</td>
                            <td class="px-6 py-5">
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-bold text-indigo-500 font-mono">{{ vault.agent_id?.split('-')[0] }}…</span>
                                    <router-link :to="`/agents/${vault.agent_id}`"
                                        class="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                        <ArrowUpRight class="w-3 h-3 text-slate-400" />
                                    </router-link>
                                </div>
                            </td>
                            <td class="px-6 py-5 text-right">
                                <p class="text-sm font-black text-slate-800 dark:text-white">{{ formatBalance(vault.available_balance) }}</p>
                                <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                                    +{{ formatBalance(vault.accrued_interest) }} Yield
                                </p>
                            </td>
                            <td class="px-6 py-5">
                                <span :class="['px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', statusColor(vault.status)]">
                                    {{ vault.status }}
                                </span>
                            </td>
                            <td class="px-6 py-5">
                                <div class="flex items-center gap-2">
                                    <!-- Audit Trail → navigates to transactions filtered by vault_ref -->
                                    <button
                                        @click="openAuditTrail(vault)"
                                        class="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                    >
                                        Audit Trail
                                    </button>
                                    <!-- Freeze / Unfreeze toggle -->
                                    <button
                                        v-if="vault.status !== 'closed'"
                                        @click="toggleFreeze(vault)"
                                        :class="[
                                            'px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 whitespace-nowrap',
                                            vault.status === 'frozen'
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                                        ]"
                                    >
                                        {{ vault.status === 'frozen' ? 'Unfreeze' : 'Freeze' }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="vaults.length === 0">
                            <td colspan="6" class="px-8 py-20 text-center">
                                <div class="text-5xl opacity-20 mb-3">🔎</div>
                                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No vaults found for selected filters</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="vaultMeta.last_page > 1" class="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400">
                    Page {{ vaultMeta.current_page }} of {{ vaultMeta.last_page }}
                    <span v-if="vaultMeta.total" class="ml-2">({{ vaultMeta.total?.toLocaleString() }} records)</span>
                </span>
                <div class="flex gap-2">
                    <button @click="prevPage" :disabled="filters.page <= 1"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        ← Prev
                    </button>
                    <button @click="nextPage" :disabled="filters.page >= (vaultMeta.last_page || 1)"
                        class="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 hover:opacity-80 transition-opacity">
                        Next →
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast notification -->
        <Transition name="slide-up">
            <div v-if="toast.show"
                class="fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest border"
                :class="toast.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500'"
            >
                {{ toast.message }}
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>
