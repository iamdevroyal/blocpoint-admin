<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  CreditCard,
  Building,
  RefreshCcw,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  History,
  Network,
  Activity,
  ShieldAlert
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const activeFilter = ref('all entries')
const showDetailDrawer = ref(false)
const selectedEntry = ref<any>(null)
const isReconciling = ref(false)
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

const journalEntries = ref([
  { id: 'TXN_99120', date: '2026-02-21 15:42', reference: 'TRF_IND_901', account: 'Agent Wallets', description: 'Fund Disbursement - Agent Doe', debit: 0, credit: 1250000.00, status: 'posted', category: 'assets' },
  { id: 'TXN_99119', date: '2026-02-21 15:42', reference: 'TRF_IND_901', account: 'Main Escrow', description: 'Fund Disbursement - Agent Doe', debit: 1250000.00, credit: 0, status: 'posted', category: 'liabilities' },
  { id: 'TXN_99118', date: '2026-02-21 14:10', reference: 'DEP_US_772', account: 'Bank Clearing', description: 'Stablecoin Swap Inflow', debit: 4500.00, credit: 0, status: 'posted', category: 'assets' },
  { id: 'TXN_99117', date: '2026-02-21 14:10', reference: 'DEP_US_772', account: 'USDC Treasury', description: 'Stablecoin Swap Inflow', debit: 0, credit: 4500.00, status: 'posted', category: 'assets' },
  { id: 'TXN_99116', date: '2026-02-21 12:30', reference: 'FEE_COLL_01', account: 'Platform Revenue', description: 'Transaction Fee Collection', debit: 0, credit: 850.25, status: 'posted', category: 'equity' }
])

const filteredEntries = computed(() => {
  return journalEntries.value.filter(entry => {
    const q = search.value.toLowerCase()
    const matchesSearch = entry.id.toLowerCase().includes(q) || 
                         entry.reference.toLowerCase().includes(q) || 
                         entry.account.toLowerCase().includes(q) ||
                         entry.description.toLowerCase().includes(q)
    
    const matchesFilter = activeFilter.value === 'all entries' || entry.category === activeFilter.value
    
    return matchesSearch && matchesFilter
  })
})

const handleReconcile = () => {
  isReconciling.value = true
  showNotification('Triggering global ledger reconciliation...', 'info')
  setTimeout(() => {
    isReconciling.value = false
    showNotification('Ledger integrity verified across all 14 partitions', 'success')
  }, 2000)
}

const handleExportGL = () => {
  const headers = ['ID', 'Date', 'Reference', 'Account', 'Description', 'Debit', 'Credit', 'Status']
  const data = filteredEntries.value.map(e => [e.id, e.date, e.reference, e.account, e.description, e.debit, e.credit, e.status])
  const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `general_ledger_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showNotification('General Ledger exported successfully', 'success')
}

function openEntry(entry: any) {
  selectedEntry.value = entry
  showDetailDrawer.value = true
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2 }).format(value)
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Ledger Explorer</h1>
        <p class="text-slate-400 mt-1">Audit the double-entry accounting logs and system-wide financial integrity.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleReconcile" :loading="isReconciling">
          <RefreshCcw :class="['w-4 h-4 mr-2', { 'animate-spin': isReconciling }]" />
          Reconcile All
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleExportGL">
          <Download class="w-4 h-4 mr-2" />
          Export GL
        </BaseButton>
      </div>
    </div>

    <!-- Quick Balances -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="bal in [
        { label: 'System Assets', value: '₦ 485.2M', icon: Building, color: 'text-indigo-400' },
        { label: 'Agent Liabilities', value: '₦ 392.1M', icon: CreditCard, color: 'text-rose-400' },
        { label: 'Unrealized Fees', value: '₦ 4.8M', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Reconciliation', value: 'Balanced', icon: CheckCircle2, color: 'text-cyan-400' }
      ]" :key="bal.label" padding="p-5" class="relative group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <component :is="bal.icon" :class="['w-6 h-6', bal.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ bal.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5">{{ bal.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Control Bar -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div class="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
        <button 
          v-for="f in ['All Entries', 'Assets', 'Liabilities', 'Equity']" :key="f"
          @click="activeFilter = f.toLowerCase()"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-all',
            activeFilter === f.toLowerCase() ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
          ]"
        >
          {{ f }}
        </button>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             v-model="search"
             type="text" 
             placeholder="Reference, TXN ID..." 
             class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
           />
        </div>
        <BaseButton variant="secondary" size="sm" class="px-3">
          <Filter class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="text-slate-500 font-bold border-b border-white/5 bg-white/[0.01] uppercase tracking-wider text-[10px]">
              <th class="px-6 py-4">Transaction Details</th>
              <th class="px-6 py-4">Account Pair</th>
              <th class="px-6 py-4">Description</th>
              <th class="px-6 py-4 text-right">Debit</th>
              <th class="px-6 py-4 text-right">Credit</th>
              <th class="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr v-for="entry in filteredEntries" :key="entry.id" class="hover:bg-white/[0.02] transition-colors group cursor-pointer" @click="openEntry(entry)">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-white group-hover:text-indigo-400 transition-colors font-mono">{{ entry.id }}</span>
                  <span class="text-[10px] text-slate-500 mt-0.5">{{ entry.date }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-slate-300">{{ entry.account }}</span>
                  <span class="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {{ entry.reference }}</span>
                </div>
              </td>
              <td class="px-6 py-4 max-w-xs truncate">
                <span class="text-xs">{{ entry.description }}</span>
              </td>
              <td class="px-6 py-4 text-right font-mono font-bold" :class="entry.debit > 0 ? 'text-white' : 'text-slate-600'">
                {{ entry.debit > 0 ? formatCurrency(entry.debit) : '—' }}
              </td>
              <td class="px-6 py-4 text-right font-mono font-bold" :class="entry.credit > 0 ? 'text-white' : 'text-slate-600'">
                {{ entry.credit > 0 ? formatCurrency(entry.credit) : '—' }}
              </td>
              <td class="px-6 py-4 text-center">
                <StatusBadge :status="entry.status as any" size="sm" class="uppercase text-[9px]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer / Totals -->
      <div class="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Total Debits: <span class="text-white ml-1">₦ 1,254,500.25</span></span>
            <div class="w-px h-3 bg-white/10"></div>
            <span>Total Credits: <span class="text-white ml-1">₦ 1,254,500.25</span></span>
         </div>
         <div class="flex gap-2">
            <BaseButton variant="ghost" size="sm" class="text-xs">Previous</BaseButton>
            <BaseButton variant="secondary" size="sm" class="text-xs border-white/5">Next Page</BaseButton>
         </div>
      </div>
    </div>
    
    <!-- Integrity Alert -->
    <div class="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
      <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <ShieldCheck class="w-6 h-6" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-white">Financial Integrity Verified</h4>
        <p class="text-xs text-slate-500">All ledger partitions are currently balanced and verified against the double-entry vault. Last check: 2 minutes ago.</p>
      </div>
    </div>

    <!-- Modals & Drawers -->

    <!-- Entry Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="`Journal Node: ${selectedEntry?.id}`" 
      description="Cryptographic Proof & MDT Audit Metadata"
      width="lg"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedEntry" class="space-y-8">
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', selectedEntry.debit > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400']">
              <component :is="selectedEntry.debit > 0 ? ArrowDownLeft : ArrowUpRight" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Entry Impact</div>
              <div class="text-xl font-bold text-white">{{ formatCurrency(selectedEntry.debit || selectedEntry.credit) }}</div>
            </div>
          </div>
          <StatusBadge :status="selectedEntry.status" size="md" />
        </div>

        <div class="space-y-4">
          <div class="flex items-start gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <Network class="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">Accounting Narrative</h4>
              <p class="text-sm text-slate-400 mt-1">{{ selectedEntry.description }}</p>
              <div class="flex items-center gap-2 mt-3 text-[10px] font-mono text-slate-500">
                <span class="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 uppercase">{{ selectedEntry.category }}</span>
                <span>•</span>
                <span>Account: {{ selectedEntry.account }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
             <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cryptographic Audit</h4>
             <Card padding="p-4" class="bg-dark-bg/50 border-white/5">
               <div class="space-y-3 font-mono text-[10px]">
                 <div class="flex justify-between">
                   <span class="text-slate-600 uppercase font-bold">MDT-ID</span>
                   <span class="text-indigo-400 font-bold">BP-GL-{{ selectedEntry.id.split('_')[1] }}-X9</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-slate-600 uppercase font-bold">HMAC-SHA256</span>
                   <span class="text-white truncate max-w-[180px]">8f3c...ae92</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-slate-600 uppercase font-bold">Verifier</span>
                   <span class="text-emerald-400 font-bold">CORE-VAULT-01</span>
                 </div>
               </div>
             </Card>
          </div>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full">
             <History class="w-4 h-4 mr-2" /> Audit Trail
           </BaseButton>
           <BaseButton variant="secondary" size="md" class="w-full text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/5">
             <ShieldAlert class="w-4 h-4 mr-2" /> Validate Hash
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" size="md" class="w-full" @click="showDetailDrawer = false">Acknowledge Audit</BaseButton>
      </template>
    </BaseDrawer>

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
