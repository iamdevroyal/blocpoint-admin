<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Wallet, 
  Search, 
  Download, 
  Activity, 
  ShieldCheck, 
  Clock,
  ChevronRight,
  PieChart,
  History,
  AlertTriangle
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'

const search = ref('')
const filterStatus = ref('all')
const isAnalyzing = ref(false)
const notification = ref<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'info'
})

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const wallets = ref([
  { id: 'W-001', owner: 'Main Treasury', balance: 840200500.00, status: 'active', type: 'Core' },
  { id: 'W-002', owner: 'Settlement Node A', balance: 15400200.00, status: 'active', type: 'Operational' },
  { id: 'W-003', owner: 'John Doe (Agent)', balance: 1250000.00, status: 'active', type: 'Float' },
  { id: 'W-004', owner: 'Sarah Smith (Agent)', balance: 45000.00, status: 'frozen', type: 'Float' }
])

const filteredWallets = computed(() => {
  return wallets.value.filter(w => {
    const query = search.value.toLowerCase()
    const matchesSearch = w.id.toLowerCase().includes(query) || 
                         w.owner.toLowerCase().includes(query) || 
                         w.type.toLowerCase().includes(query)
    
    const matchesFilter = filterStatus.value === 'all' || w.status === filterStatus.value
    
    return matchesSearch && matchesFilter
  })
})

const handleExport = () => {
  const headers = ['ID', 'Owner', 'Type', 'Balance', 'Status']
  const data = filteredWallets.value.map(w => [w.id, w.owner, w.type, w.balance, w.status])
  const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `wallet_balance_report_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showNotification('Balance report generated successfully', 'success')
}

const handleAnalyze = () => {
  if (isAnalyzing.value) return
  isAnalyzing.value = true
  showNotification('Starting liquidity concentration audit...', 'info')
  
  setTimeout(() => {
    isAnalyzing.value = false
    showNotification('Concentration audit complete. No critical risks detected.', 'success')
  }, 2000)
}

function handleHistory(id: string) {
  showNotification(`Loading ledger history for ${id}...`, 'info')
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val)
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Wallet class="w-8 h-8 text-indigo-400" />
          Ecosystem Wallets
        </h1>
        <p class="text-slate-400 mt-1">Holistic monitoring of all float and operational liquidity nodes.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleExport">
          <Download class="w-4 h-4 mr-2" />
          Balance Report
        </BaseButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card v-for="stat in [
        { label: 'Total Network Float', value: '₦ 1.4B', icon: Activity, color: 'text-indigo-400' },
        { label: 'Active Wallets', value: '1,204', icon: ShieldCheck, color: 'text-emerald-400' },
        { label: 'Frozen Assets', value: '₦ 4.2M', icon: Clock, color: 'text-rose-400' },
        { label: 'Node Vitality', value: '99.4%', icon: PieChart, color: 'text-cyan-400' }
      ]" :key="stat.label">
        <div class="flex items-center gap-3">
          <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ stat.label }}</span>
            <p class="text-lg font-bold text-white mt-0.5">{{ stat.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Wallets Table -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="relative w-72">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             v-model="search" 
             type="text" 
             placeholder="Owner, ID or Type..." 
             class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
           />
        </div>
        <select 
          v-model="filterStatus"
          class="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      <Card padding="p-0">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/[0.01] border-b border-white/5">
            <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th class="px-6 py-4">Wallet ID</th>
              <th class="px-6 py-4">Owner / Node</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Available Balance</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr v-for="w in filteredWallets" :key="w.id" class="hover:bg-white/[0.01] transition-colors group">
              <td class="px-6 py-4 font-mono text-xs font-bold text-indigo-400">{{ w.id }}</td>
              <td class="px-6 py-4">
                <span class="font-bold text-white">{{ w.owner }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs text-slate-500 uppercase font-medium">{{ w.type }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold font-mono text-white">{{ formatCurrency(w.balance) }}</span>
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="w.status as any" size="sm" class="uppercase text-[9px]" />
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 text-slate-400">
                   <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0" title="View History" @click="handleHistory(w.id)">
                     <History class="w-4 h-4" />
                   </BaseButton>
                   <router-link :to="`/agents/${w.id}`">
                     <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0" title="View Node Detail">
                       <ChevronRight class="w-4 h-4" />
                     </BaseButton>
                   </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>

    <!-- Liquidity Distribution Banner -->
    <div class="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
       <div class="flex items-center gap-6">
         <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400">
           <PieChart class="w-8 h-8" />
         </div>
         <div>
           <h4 class="text-lg font-bold text-white">Liquidity Distribution Audit</h4>
           <p class="text-sm text-slate-500">View real-time concentration risk and liquidity distribution across all network agents.</p>
         </div>
       </div>
       <BaseButton variant="primary" class="shrink-0" @click="handleAnalyze" :loading="isAnalyzing">
         {{ isAnalyzing ? 'Auditing...' : 'Analyze Concentration' }}
       </BaseButton>
    </div>

    <!-- Action Notification -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="notification.show" class="fixed bottom-8 right-8 z-[100] max-w-sm w-full bg-[#1a1f2e] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 
          notification.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
        ]">
          <component :is="notification.type === 'success' ? ShieldCheck : notification.type === 'error' ? AlertTriangle : Activity" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
