<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Globe, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCcw,
  TrendingUp,
  Coins,
  Search,
  Zap,
  Clock,
  ExternalLink,
  Lock,
  Database,
  BarChart3,
  Activity,
  ArrowRight
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const reserveSearch = ref('')
const swapSearch = ref('')
const showReplenishModal = ref(false)
const showHistoryModal = ref(false)
const showReserveDrawer = ref(false)
const showSwapDrawer = ref(false)
const selectedReserve = ref<any>(null)
const selectedSwap = ref<any>(null)

const isSyncing = ref(false)
const isReplenishing = ref(false)

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

const activeReserves = ref([
  { 
    currency: 'USDT', 
    symbol: 'USDT', 
    balance: '241,502.45', 
    network: 'TRC-20', 
    status: 'optimal', 
    provider: 'Yellow Card',
    cold_storage: '₦ 1.2B Anchor',
    uptime: '99.99%',
    last_audit: '2026-02-20'
  },
  { 
    currency: 'USDC', 
    symbol: 'USDC', 
    balance: '85,000.00', 
    network: 'ERC-20', 
    status: 'optimal', 
    provider: 'Direct Custody',
    cold_storage: '₦ 450M Anchor',
    uptime: '100%',
    last_audit: '2026-02-18'
  },
  { 
    currency: 'BUSD', 
    symbol: 'BUSD', 
    balance: '12,400.00', 
    network: 'BEP-20', 
    status: 'low_liquidity', 
    provider: 'Binance Relay',
    cold_storage: '₦ 85M Anchor',
    uptime: '94.2%',
    last_audit: '2026-02-15'
  }
])

const recentSwaps = ref([
  { id: 'SWP-001', pair: 'USDT/NGN', amount: '5,000 USDT', rate: '1,540.20', status: 'completed', time: '5 mins ago', partner_id: 'YC-88219-X', proof: '0x882...abc' },
  { id: 'SWP-002', pair: 'USDC/NGN', amount: '1,200 USDC', rate: '1,542.00', status: 'pending', time: '12 mins ago', partner_id: 'DC-11202-Y', proof: 'Pending...' },
  { id: 'SWP-003', pair: 'USDT/NGN', amount: '10,000 USDT', rate: '1,538.50', status: 'completed', time: '45 mins ago', partner_id: 'YC-88190-Z', proof: '0xf52...def' }
])

const fxHistory = [
  { pair: 'USDT/NGN', rate: '1,540.20', trend: 'up', time: '2026-02-22 09:00' },
  { pair: 'USDC/NGN', rate: '1,542.45', trend: 'down', time: '2026-02-22 08:30' },
  { pair: 'ETH/NGN', rate: '4,210,000', trend: 'up', time: '2026-02-22 08:00' }
]

const filteredReserves = computed(() => {
  return activeReserves.value.filter(res => 
    res.currency.toLowerCase().includes(reserveSearch.value.toLowerCase()) ||
    res.network.toLowerCase().includes(reserveSearch.value.toLowerCase())
  )
})

const filteredSwaps = computed(() => {
  return recentSwaps.value.filter(swap => 
    swap.id.toLowerCase().includes(swapSearch.value.toLowerCase()) ||
    swap.pair.toLowerCase().includes(swapSearch.value.toLowerCase())
  )
})

const handleSyncRates = () => {
  isSyncing.value = true
  showNotification('Syncing global mid-market FX rates...', 'info')
  setTimeout(() => {
    isSyncing.value = false
    showNotification('FX rates successfully normalized across all pairs.', 'success')
  }, 2000)
}

const handleReplenish = () => {
  isReplenishing.value = true
  setTimeout(() => {
    isReplenishing.value = false
    showReplenishModal.value = false
    showNotification('Replenishment request broadcasted to liquidity node.', 'success')
  }, 1500)
}

function openReserveDetail(res: any) {
  selectedReserve.value = res
  showReserveDrawer.value = true
}

function openSwapDetail(swap: any) {
  selectedSwap.value = swap
  showSwapDrawer.value = true
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Coins class="w-8 h-8 text-cyan-400" />
          Stablecoin Reservoir
        </h1>
        <p class="text-slate-400 mt-1">Cross-border liquidity monitoring and swap orchestration.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleSyncRates" :loading="isSyncing">
          <RefreshCcw class="w-4 h-4 mr-2" />
          Sync Rates
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="showReplenishModal = true">
          <TrendingUp class="w-4 h-4 mr-2" />
          Replenish Reserve
        </BaseButton>
      </div>
    </div>

    <!-- Reserve Health Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">
        <Globe class="w-5 h-5 text-indigo-400" />
        Liquidity Reserves
      </h2>
      <div class="relative w-64">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input 
          v-model="reserveSearch"
          type="text" 
          placeholder="Filter reserves..." 
          class="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" 
        />
      </div>
    </div>

    <!-- Reserve Health Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card v-for="res in filteredReserves" :key="res.currency" class="hover:border-indigo-500/30 transition-all cursor-pointer group" @click="openReserveDetail(res)">
        <div class="flex flex-col gap-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/5">
                {{ res.symbol }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">{{ res.currency }} Reserve</h4>
                <p class="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">{{ res.network }}</p>
              </div>
            </div>
            <StatusBadge :status="res.status as any" size="sm" class="uppercase text-[8px]" />
          </div>
          
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Balance</p>
            <p class="text-2xl font-bold text-white font-mono mt-1">{{ res.balance }} <span class="text-sm text-slate-500 font-normal ml-1">{{ res.symbol }}</span></p>
          </div>

          <div class="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>{{ res.provider }}</span>
            <div class="flex items-center gap-1 text-indigo-400">
              Flow Detail <ArrowUpRight class="w-3 h-3" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Swaps & Trends -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Swap Ledger (Left 2/3) -->
      <Card title="Real-time Swap Stream" padding="p-0" class="lg:col-span-2">
        <template #actions>
          <div class="relative w-48 mr-2">
            <Search class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input 
              v-model="swapSearch"
              type="text" 
              placeholder="Search swaps..." 
              class="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-7 text-[9px] text-white focus:outline-none" 
            />
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/[0.01] border-b border-white/5">
              <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-4">Session ID</th>
                <th class="px-6 py-4">Pair</th>
                <th class="px-6 py-4">Inbound / Outbound</th>
                <th class="px-6 py-4">FX Rate</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              <tr v-for="swap in filteredSwaps" :key="swap.id" class="hover:bg-white/[0.01] transition-colors group cursor-pointer" @click="openSwapDetail(swap)">
                <td class="px-6 py-4 font-mono text-xs font-bold text-indigo-400">{{ swap.id }}</td>
                <td class="px-6 py-4 text-xs font-bold text-white">{{ swap.pair }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <ArrowDownLeft class="w-3 h-3 text-emerald-400" />
                    <span class="font-bold font-mono">{{ swap.amount }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 font-mono text-xs text-slate-400">₦ {{ swap.rate }}</td>
                <td class="px-6 py-4">
                  <StatusBadge :status="swap.status as any" size="sm" class="uppercase text-[9px]" />
                </td>
                <td class="px-6 py-4 text-right">
                  <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0 text-indigo-400 hover:text-white transition-opacity group-hover:opacity-100 opacity-0">
                    <ArrowRight class="w-4 h-4" />
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- FX Engine Health -->
      <div class="space-y-6">
        <Card title="Liquidity Bridge Status">
          <div class="space-y-4">
            <div v-for="bridge in [
              { name: 'Yellow Card Relay', status: 'Optimal', icon: Globe },
              { name: 'Binance Smart Bridge', status: 'De-synced', icon: AlertTriangle },
              { name: 'BlocPoint Direct Vault', status: 'Secured', icon: ShieldCheck }
            ]" :key="bridge.name" class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white/5 rounded-lg text-indigo-400">
                  <component :is="bridge.icon" class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">{{ bridge.name }}</h4>
                  <p class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ bridge.status }}</p>
                </div>
              </div>
              <div :class="['w-2 h-2 rounded-full', bridge.status === 'Optimal' ? 'bg-emerald-500' : bridge.status === 'Secured' ? 'bg-indigo-500' : 'bg-rose-500 animate-pulse']"></div>
            </div>
          </div>
        </Card>

        <Card title="Quick Conversion">
          <div class="space-y-4">
            <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USDT/NGN</span>
              <span class="text-xs font-mono font-bold text-emerald-400">₦ 1,540.20</span>
            </div>
            <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USDC/NGN</span>
              <span class="text-xs font-mono font-bold text-emerald-400">₦ 1,542.45</span>
            </div>
            <BaseButton variant="secondary" class="w-full border-white/10 mt-2" @click="showHistoryModal = true">
              <History class="w-4 h-4 mr-2" /> View FX History
            </BaseButton>
          </div>
        </Card>
      </div>

      </div>

    <!-- Modals & Drawers -->

    <!-- Replenish Reserve Modal -->
    <BaseModal 
      :show="showReplenishModal" 
      @close="showReplenishModal = false"
      title="Initiate Replenishment" 
      description="Request a liquidity influx from a partner liquidity provider."
    >
      <div class="space-y-4">
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Target Reserve</label>
          <select class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
            <option>USDT Reservoir (TRC-20)</option>
            <option>USDC Reservoir (ERC-20)</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Amount to Request</label>
          <div class="relative">
             <input type="text" placeholder="0.00" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" />
             <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-500 uppercase">USDT</span>
          </div>
        </div>
        <div class="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 text-xs">
           <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
           <p class="text-slate-400 leading-relaxed">Cross-network liquidity requests typically take 2-10 minutes for settlement confirmations.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="secondary" @click="showReplenishModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" @click="handleReplenish" :loading="isReplenishing">Broadcast Request</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- FX History Modal -->
    <BaseModal 
      :show="showHistoryModal" 
      @close="showHistoryModal = false"
      title="Mid-Market FX History" 
      description="Real-time audit log of exchange rate normalization events."
      width="lg"
    >
      <div class="space-y-2">
        <div v-for="h in fxHistory" :key="h.time" class="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
           <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                <TrendingUp v-if="h.trend === 'up'" class="w-5 h-5" />
                <TrendingDown v-else class="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div class="text-xs font-bold text-white">{{ h.pair }}</div>
                <div class="text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-0.5">{{ h.time }}</div>
              </div>
           </div>
           <div class="text-right">
              <div :class="['text-sm font-bold font-mono', h.trend === 'up' ? 'text-emerald-400' : 'text-rose-400']">₦ {{ h.rate }}</div>
              <div class="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Confirmed Mid-Market</div>
           </div>
        </div>
      </div>
    </BaseModal>

    <!-- Reserve Detail Drawer -->
    <BaseDrawer 
      :show="showReserveDrawer" 
      :title="`${selectedReserve?.currency} Reserve Audit`" 
      description="Vault health, bridge uptime, and cryptographic anchoring"
      @close="showReserveDrawer = false"
    >
      <div v-if="selectedReserve" class="space-y-8">
        <div class="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-4">
           <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                 <div class="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-sm ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10">
                    {{ selectedReserve.symbol }}
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider">{{ selectedReserve.network }} Gateway</h4>
                    <p class="text-[10px] text-slate-400">{{ selectedReserve.provider }} Relay</p>
                 </div>
              </div>
              <StatusBadge :status="selectedReserve.status" size="md" />
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div class="absolute -right-2 -top-2 text-white/5 group-hover:text-cyan-500/10 transition-colors">
                <Database class="w-16 h-16" />
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Vault Anchor</div>
              <div class="text-xl font-bold text-white font-mono leading-none">{{ selectedReserve.cold_storage }}</div>
           </div>
           <div class="p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div class="absolute -right-2 -top-2 text-white/5 group-hover:text-emerald-500/10 transition-colors">
                <ShieldCheck class="w-16 h-16" />
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Bridge Uptime</div>
              <div class="text-xl font-bold text-emerald-400 font-mono leading-none">{{ selectedReserve.uptime }}</div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cryptographic Health</h4>
           <div class="space-y-3">
              <div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                 <div class="flex items-center gap-3">
                    <Lock class="w-5 h-5 text-indigo-400" />
                    <div>
                       <div class="text-xs font-bold text-white">Cold Storage Anchor</div>
                       <div class="text-[9px] text-slate-500 mt-0.5">Last Audited: {{ selectedReserve.last_audit }}</div>
                    </div>
                 </div>
                 <StatusBadge status="completed" size="xs" />
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                 <div class="flex items-center gap-3">
                    <Activity class="w-5 h-5 text-indigo-400" />
                    <div>
                       <div class="text-xs font-bold text-white">Bridge Sync Pulse</div>
                       <div class="text-[9px] text-slate-500 mt-0.5">Real-time Latency: 42ms</div>
                    </div>
                 </div>
                 <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
           </div>
        </div>

        <div class="pt-4 space-y-3 border-t border-white/5">
           <BaseButton variant="primary" class="w-full">
             <Zap class="w-4 h-4 mr-2" /> Broadcast Sync Pulse
           </BaseButton>
           <BaseButton variant="secondary" class="w-full">
             <BarChart3 class="w-4 h-4 mr-2" /> view Liquidity Depth
           </BaseButton>
        </div>
      </div>
    </BaseDrawer>

    <!-- Swap Detail Drawer -->
    <BaseDrawer 
      :show="showSwapDrawer" 
      :title="`Swap Session: ${selectedSwap?.id}`" 
      description="FX Lifecycle and Settlement confirmation"
      @close="showSwapDrawer = false"
    >
      <div v-if="selectedSwap" class="space-y-8">
        <div class="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-6">
           <div class="flex justify-between items-center">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pair Execution</div>
              <StatusBadge :status="selectedSwap.status" size="sm" />
           </div>
           
           <div class="flex items-center justify-between">
              <div class="text-center flex-1">
                 <div class="text-2xl font-bold text-white font-mono">{{ selectedSwap.amount.split(' ')[0] }}</div>
                 <div class="text-[10px] text-slate-500 uppercase font-bold mt-1">{{ selectedSwap.amount.split(' ')[1] }}</div>
              </div>
              <div class="px-6">
                 <div class="p-2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <ArrowRight class="w-5 h-5" />
                 </div>
              </div>
              <div class="text-center flex-1">
                 <div class="text-2xl font-bold text-emerald-400 font-mono">₦ {{ (parseFloat(selectedSwap.amount.replace(/,/g, '')) * parseFloat(selectedSwap.rate.replace(/,/g, ''))).toLocaleString() }}</div>
                 <div class="text-[10px] text-slate-500 uppercase font-bold mt-1">NGN</div>
              </div>
           </div>

           <div class="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
              <span class="text-[10px] font-bold text-slate-500 uppercase">Mid-Market Rate</span>
              <span class="text-sm font-bold font-mono text-white">1 {{ selectedSwap.symbol || 'USDT' }} = ₦ {{ selectedSwap.rate }}</span>
           </div>
        </div>

        <div class="space-y-4 text-xs px-2">
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Partner Correlation ID</span>
              <span class="text-white font-mono font-bold">{{ selectedSwap.partner_id }}</span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Network Fee Anchor</span>
              <span class="text-white font-bold">$ 0.00 (Yellow Card Relay)</span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Execution Timestamp</span>
              <span class="text-white font-bold flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                {{ selectedSwap.time }}
              </span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Settlement Status</span>
              <span class="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">On-Chain Confirmed</span>
           </div>
        </div>

        <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
           <div class="flex items-center gap-3 mb-3">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span class="text-[10px] font-bold text-white uppercase tracking-widest">Hash Proof</span>
           </div>
           <div class="bg-black/20 p-3 rounded-lg font-mono text-[10px] text-slate-400 break-all select-all">
              {{ selectedSwap.proof }}
           </div>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full">
             <ExternalLink class="w-4 h-4 mr-2" /> Explorer View
           </BaseButton>
           <BaseButton variant="secondary" size="md" class="w-full">
             <Globe class="w-4 h-4 mr-2" /> Global Relay
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" size="md" class="w-full" @click="showSwapDrawer = false">Acknowledge Swap Session</BaseButton>
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

<style scoped>
</style>
