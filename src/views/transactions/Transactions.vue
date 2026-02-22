<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Clock,
  ChevronRight,
  MoreHorizontal,
  History,
  AlertTriangle,
  Code,
  Ban,
  Fingerprint,
  Mail,
  CheckCircle2,
  XCircle,
  ShieldAlert
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const activeFilter = ref('all')

// Drawer State
const showDetailDrawer = ref(false)
const selectedTxn = ref<any>(null)
const isRefreshing = ref(false)
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

function openTxn(txn: any) {
  selectedTxn.value = txn
  showDetailDrawer.value = true
}

const handleRefresh = () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  
  // Simulate network delay
  setTimeout(() => {
    const newTxn = { 
      id: `TXN-882${Math.floor(Math.random() * 9000) + 1000}`, 
      type: 'Transfer', 
      agent: 'New Agent ' + (transactions.value.length + 1), 
      amount: Math.random() * 500000, 
      direction: Math.random() > 0.5 ? 'in' : 'out', 
      status: 'completed', 
      date: 'Just now', 
      bank: 'Standard Chartered'
    }
    transactions.value.unshift(newTxn)
    isRefreshing.value = false
    showNotification('Transaction stream updated with new data', 'success')
  }, 1000)
}

const handleExport = () => {
  const headers = ['ID', 'Type', 'Agent', 'Amount', 'Status', 'Date']
  const data = filteredTransactions.value.map(t => [t.id, t.type, t.agent, t.amount, t.status, t.date])
  const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleViewLedger() {
  showNotification(`Redirecting to ledger for ${selectedTxn.value?.id}...`, 'info')
}

function handleFlagTxn() {
  if (selectedTxn.value) {
    selectedTxn.value.isFlagged = !selectedTxn.value.isFlagged
    showNotification(
      selectedTxn.value.isFlagged ? 'Transaction successfully flagged for review' : 'Transaction flag removed',
      selectedTxn.value.isFlagged ? 'error' : 'success'
    )
  }
}

const transactions = ref([
  { 
    id: 'TXN-8821094', 
    type: 'Transfer', 
    agent: 'John Doe', 
    amount: 450000.00, 
    direction: 'out', 
    status: 'completed', 
    date: '2 mins ago', 
    bank: 'Kuda Bank',
    beneficiary: 'Alice Smith (009212234)',
    metadata: {
      ip: '192.168.1.45',
      device: 'POS-T1000-8822',
      session_id: 'sess_99812x',
      location: 'Lagos, NG'
    },
    timeline: [
      { event: 'Initiated', time: '14:28:01', status: 'completed' },
      { event: 'Risk Scanned', time: '14:28:05', status: 'completed' },
      { event: 'Ledger Posted', time: '14:28:10', status: 'completed' },
      { event: 'Bank Settlement', time: '14:28:45', status: 'completed' }
    ]
  },
  { 
    id: 'TXN-8821093', 
    type: 'Deposit', 
    agent: 'Sarah Smith', 
    amount: 1200000.00, 
    direction: 'in', 
    status: 'completed', 
    date: '5 mins ago', 
    bank: 'Main Treasury',
    timeline: [
      { event: 'Funds Received', time: '14:25:01', status: 'completed' },
      { event: 'Wallet Credited', time: '14:25:10', status: 'completed' }
    ]
  },
  { id: 'TXN-8821092', type: 'Stablecoin Swap', agent: 'Femi Adebayo', amount: 2500.00, direction: 'out', status: 'pending', date: '12 mins ago', bank: 'YellowCard', isFlagged: true },
  { id: 'TXN-8821091', type: 'Withdrawal', agent: 'Amaka Obi', amount: 85000.00, direction: 'out', status: 'failed', date: '45 mins ago', bank: 'GTBank' }
])

const filteredTransactions = computed(() => {
  return transactions.value.filter(txn => {
    const query = search.value.toLowerCase()
    const matchesSearch = txn.id.toLowerCase().includes(query) || 
                         txn.agent.toLowerCase().includes(query) || 
                         txn.type.toLowerCase().includes(query)
    
    let matchesFilter = true
    if (activeFilter.value === 'inflow') matchesFilter = txn.direction === 'in'
    else if (activeFilter.value === 'outflow') matchesFilter = txn.direction === 'out'
    else if (activeFilter.value === 'flagged') matchesFilter = txn.isFlagged === true
    
    return matchesSearch && matchesFilter
  })
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
}

const stats = [
  { label: 'Today\'s Volume', value: '₦ 14.8M', icon: Activity, color: 'text-indigo-400' },
  { label: 'Success Rate', value: '99.4%', icon: Zap, color: 'text-emerald-400' },
  { label: 'Security Checks', value: '2.4k', icon: ShieldCheck, color: 'text-cyan-400' },
  { label: 'Pending TXNs', value: '18', icon: Clock, color: 'text-amber-400' }
]
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Transaction Monitor</h1>
        <p class="text-slate-400 mt-1">Real-time flow of funds across the BlocPoint ecosystem.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleExport">
          <Download class="w-4 h-4 mr-2" />
          Export Data
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleRefresh" :loading="isRefreshing">
          <RefreshCcw :class="['w-4 h-4 mr-2', { 'animate-spin': isRefreshing }]" />
          {{ isRefreshing ? 'Updating...' : 'Refresh Stream' }}
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

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" padding="p-5" class="relative group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-2xl">
      <div class="flex items-center gap-1">
        <button 
          v-for="f in ['All', 'Inflow', 'Outflow', 'Flagged']" :key="f"
          @click="activeFilter = f.toLowerCase()"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-xl transition-all',
            activeFilter === f.toLowerCase() ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
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
             placeholder="TXN ID, Agent, Reference..." 
             class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
           />
        </div>
        <BaseButton variant="secondary" size="sm">
          <Filter class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="text-slate-500 font-bold border-b border-white/5 bg-white/[0.01] uppercase tracking-wider text-[10px]">
              <th class="px-6 py-4">Transaction ID</th>
              <th class="px-6 py-4">Agent / Counterparty</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Destination</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr 
              v-for="txn in filteredTransactions" 
              :key="txn.id" 
              @click="openTxn(txn)"
              class="hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-white group-hover:text-indigo-400 transition-colors font-mono">{{ txn.id }}</span>
                  <span class="text-[10px] text-slate-500 mt-0.5">{{ txn.date }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-semibold text-white">{{ txn.agent }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-2 h-2 rounded-full',
                    txn.direction === 'in' ? 'bg-emerald-500' : 'bg-rose-500'
                  ]"></div>
                  <span class="text-xs">{{ txn.type }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'font-bold font-mono',
                  txn.direction === 'in' ? 'text-emerald-400' : 'text-slate-200'
                ]">
                  {{ txn.direction === 'in' ? '+' : '-' }} {{ formatCurrency(txn.amount) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs text-slate-400">{{ txn.bank }}</span>
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="txn.status as any" size="sm" class="uppercase text-[9px]" />
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0" @click.stop="openTxn(txn)">
                    <ChevronRight class="w-4 h-4" />
                  </BaseButton>
                  
                  <Menu as="div" class="relative inline-block text-left">
                    <MenuButton @click.stop>
                      <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0">
                        <MoreHorizontal class="w-4 h-4" />
                      </BaseButton>
                    </MenuButton>

                    <transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/5 rounded-xl bg-[#1a1f2e] border border-white/10 shadow-2xl focus:outline-none z-50">
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <CheckCircle2 class="mr-3 h-4 w-4 text-emerald-400" />
                              Approve Release
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <XCircle class="mr-3 h-4 w-4 text-rose-400" />
                              Decline & Reverse
                            </button>
                          </MenuItem>
                        </div>
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <ShieldAlert class="mr-3 h-4 w-4 text-amber-400" />
                              Flag for Review
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <Mail class="mr-3 h-4 w-4 text-indigo-400" />
                              Notify Agent
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </transition>
                  </Menu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest">
        <span>Displaying latest 50 operations</span>
        <div class="flex gap-2">
          <BaseButton variant="ghost" size="sm">Older</BaseButton>
          <BaseButton variant="secondary" size="sm" class="border-white/10">Stream History</BaseButton>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="selectedTxn?.id" 
      description="Transactional Audit & Routing Detail"
      width="lg"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedTxn" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        
        <!-- Quick Header Details -->
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', selectedTxn.direction === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white']">
              <component :is="selectedTxn.direction === 'in' ? ArrowDownLeft : ArrowUpRight" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ selectedTxn.type }}</div>
              <div class="text-xl font-bold text-white">{{ formatCurrency(selectedTxn.amount) }}</div>
            </div>
          </div>
          <StatusBadge :status="selectedTxn.status" size="md" />
        </div>

        <!-- Beneficiary / Routing -->
        <div class="space-y-3">
          <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Routing & Settlement</h4>
          <Card padding="p-4">
            <div class="space-y-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Initiating Agent</span>
                <span class="text-white font-bold">{{ selectedTxn.agent }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Destination Bank</span>
                <span class="text-white font-bold">{{ selectedTxn.bank }}</span>
              </div>
              <div v-if="selectedTxn.beneficiary" class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Beneficiary</span>
                <span class="text-white font-bold">{{ selectedTxn.beneficiary }}</span>
              </div>
            </div>
          </Card>
        </div>

        <!-- State Machine Timeline -->
        <div class="space-y-4">
          <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lifecycle Timeline</h4>
          <div class="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
            <div 
              v-for="(step, i) in (selectedTxn.timeline || [ { event: 'Operation Registered', time: selectedTxn.date, status: 'completed' } ])" 
              :key="i"
              class="relative"
            >
              <div :class="['absolute -left-[19px] top-1 w-2 h-2 rounded-full border-2 border-dark-bg', step.status === 'completed' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-slate-700']"></div>
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs font-bold text-white">{{ step.event }}</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Automated System Check</div>
                </div>
                <div class="text-[10px] font-mono font-bold text-slate-600">{{ step.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Metadata -->
        <div class="space-y-3">
          <div class="flex items-center justify-between ml-1">
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Metadata</h4>
            <BaseButton variant="ghost" size="sm" class="h-6 text-[9px] px-2">
              <Code class="w-3 h-3 mr-1" /> Raw JSON
            </BaseButton>
          </div>
          <div class="bg-dark-bg p-4 rounded-2xl border border-white/5 space-y-4">
            <div v-for="(v, k) in selectedTxn.metadata || { ip: '192.168.x.x', device: 'Unknown', source: 'Web-Admin' }" :key="k" class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-slate-600 uppercase">{{ String(k).replace('_', ' ') }}</span>
              <span class="text-[10px] font-mono text-slate-400">{{ v }}</span>
            </div>
          </div>
        </div>

        <!-- Operational Actions -->
        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full" @click="handleViewLedger">
             <History class="w-4 h-4 mr-2" /> View Ledger
           </BaseButton>
           <BaseButton 
             variant="secondary" 
             size="md" 
             class="w-full transition-all"
             :class="[selectedTxn.isFlagged ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-amber-400 border-amber-500/20 hover:bg-amber-500/5']"
             @click="handleFlagTxn"
           >
             <AlertTriangle class="w-4 h-4 mr-2" /> 
             {{ selectedTxn.isFlagged ? 'Unflag Transaction' : 'Flag Transaction' }}
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" class="w-full" @click="showDetailDrawer = false">
           Close Audit View
        </BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>
