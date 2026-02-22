<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  BarChart3, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Settings,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Activity,
  Network,
  Search,
  AlertTriangle,
  History,
  ShieldAlert
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const filterStatus = ref('all')
const showMoveModal = ref(false)
const showLimitModal = ref(false)
const showDetailDrawer = ref(false)
const selectedSet = ref<any>(null)
const isMoving = ref(false)
const isUpdating = ref(false)
const isOrchestrating = ref(false)

const stats = [
  { label: 'Ecosystem Float', value: '₦ 842.1M', trend: '+4.2%', isUp: true, icon: Wallet, color: 'text-indigo-400' },
  { label: 'Core Reserve', value: '₦ 150.0M', trend: 'Stable', isUp: true, icon: ShieldCheck, color: 'text-emerald-400' },
  { label: 'Settlement Latency', value: '42s', trend: '-15%', isUp: true, icon: Zap, color: 'text-cyan-400' },
  { label: 'Network Vitality', value: '98.2%', trend: '+0.5%', isUp: true, icon: Activity, color: 'text-purple-400' }
]

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

const moveForm = reactive({
  source: 'NGN Liquidity Pool',
  destination: 'Settlement Node A',
  amount: 0,
  purpose: 'Standard Node Liquidity'
})

const limitForm = reactive({
  ngnThreshold: 50000000,
  usdtThreshold: 10000,
  alertEmail: 'treasury@blocpoint.com'
})

const settlements = ref([
  { id: 'SET-9901', bank: 'Access Bank', amount: 15000000.00, direction: 'out', status: 'processing', eta: '5 mins', reference: 'MDT-REF-X8812', metadata: { protocol: 'MDT-v2', latency: '24ms', verifier: 'Vault-Core-A' } },
  { id: 'SET-9902', bank: 'YellowCard', amount: 45000.00, direction: 'in', status: 'completed', eta: 'Done', reference: 'YC-SET-P0021' },
  { id: 'SET-9903', bank: 'Sterling Bank', amount: 1200000.00, direction: 'out', status: 'pending', eta: '12 mins' },
  { id: 'SET-9904', bank: 'Zenith Bank', amount: 8000000.00, direction: 'in', status: 'completed', eta: 'Done' }
])

const filteredSettlements = computed(() => {
  return settlements.value.filter(s => {
    const q = search.value.toLowerCase()
    const matchesSearch = s.id.toLowerCase().includes(q) || s.bank.toLowerCase().includes(q)
    const matchesFilter = filterStatus.value === 'all' || s.status === filterStatus.value
    return matchesSearch && matchesFilter
  })
})

function openSet(set: any) {
  selectedSet.value = set
  showDetailDrawer.value = true
}

const handleMove = () => {
  isMoving.value = true
  setTimeout(() => {
    isMoving.value = false
    showMoveModal.value = false
    showNotification(`Successfully moved ${formatCurrency(moveForm.amount)} to ${moveForm.destination}`, 'success')
  }, 1500)
}

const handleUpdateLimits = () => {
  isUpdating.value = true
  setTimeout(() => {
    isUpdating.value = false
    showLimitModal.value = false
    showNotification('Reserve thresholds updated successfully', 'success')
  }, 1000)
}

const handleBatchSettlement = () => {
  isOrchestrating.value = true
  showNotification('Orchestrating batch settlement protocol...', 'info')
  setTimeout(() => {
    isOrchestrating.value = false
    showNotification('Batch settlement initiated for 14 nodes.', 'success')
  }, 2000)
}

const handleRebalance = () => {
  showNotification('Triggering automated reserve rebalancing...', 'info')
}

const reserves = [
  { name: 'NGN Liquidity Pool', balance: '₦ 640.2M', utilization: 72, provider: 'BlocPoint Direct' },
  { name: 'USDT Stable Reservoir', balance: '$ 241.5k', utilization: 45, provider: 'Yellow Card' },
  { name: 'Bridge Collateral', balance: '₦ 25.0M', utilization: 12, provider: 'Settlement Vault' }
]

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val)
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Treasury Command</h1>
        <p class="text-slate-400 mt-1">Ecosystem-wide liquidity management and settlement orchestration.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="showLimitModal = true">
          <Settings class="w-4 h-4 mr-2" />
          Reserve Limits
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="showMoveModal = true">
          <TrendingUp class="w-4 h-4 mr-2" />
          Move Liquidity
        </BaseButton>
      </div>
    </div>

    <!-- Core Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" class="relative group overflow-hidden border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      </Card>
    </div>

    <!-- Main Command View -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Reserve Pools (Left 2/3) -->
      <div class="xl:col-span-2 space-y-8">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <Network class="w-5 h-5 text-indigo-400" />
            Active Liquidity Reservoirs
          </h2>
          <BaseButton variant="ghost" size="sm" class="text-indigo-400">View Node Topology</BaseButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card v-for="res in reserves" :key="res.name" padding="p-6" class="flex flex-col gap-6 hover:border-indigo-500/30 transition-all cursor-pointer group">
            <div class="flex justify-between items-start">
              <div class="p-2.5 bg-white/5 rounded-xl border border-white/10 text-indigo-400 group-hover:text-white transition-colors">
                <Globe v-if="res.name.includes('USDT')" class="w-5 h-5" />
                <BarChart3 v-else class="w-5 h-5" />
              </div>
              <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0">
                <MoreVertical class="w-4 h-4 text-slate-600" />
              </BaseButton>
            </div>
            <div>
              <h4 class="text-xs font-bold text-white mb-1">{{ res.name }}</h4>
              <p class="text-2xl font-bold text-white tracking-tight">{{ res.balance }}</p>
              <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{{ res.provider }}</p>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-[10px] font-bold">
                <span class="text-slate-500 uppercase">Utilization</span>
                <span :class="res.utilization > 80 ? 'text-rose-400' : 'text-emerald-400'">{{ res.utilization }}%</span>
              </div>
              <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-indigo-500 transition-all duration-1000" 
                  :style="{ width: res.utilization + '%' }"
                ></div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Settlement Queue -->
        <Card title="Inter-Bank Settlement Flow" padding="p-0">
          <template #actions>
            <div class="flex items-center gap-4">
              <div class="relative w-48 hidden sm:block">
                 <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                 <input 
                   v-model="search"
                   type="text" 
                   placeholder="Search ID, Bank..." 
                   class="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" 
                 />
              </div>
              <select 
                v-model="filterStatus"
                class="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <span class="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                Live Engine Active
              </span>
            </div>
          </template>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-white/[0.01] border-b border-white/5">
                <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th class="px-6 py-4">Protocol ID</th>
                  <th class="px-6 py-4">Counterparty</th>
                  <th class="px-6 py-4">Settlement Amount</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Est. T+0 Time</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                <tr v-for="set in filteredSettlements" :key="set.id" class="hover:bg-white/[0.01] transition-colors group cursor-pointer" @click="openSet(set)">
                  <td class="px-6 py-4 font-mono text-xs font-bold text-indigo-400">{{ set.id }}</td>
                  <td class="px-6 py-4">
                    <div class="text-xs font-bold text-white">{{ set.bank }}</div>
                    <div class="text-[10px] text-slate-500 uppercase mt-0.5">MDT Protocol</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <component :is="set.direction === 'in' ? ArrowDownLeft : ArrowUpRight" :class="['w-4 h-4', set.direction === 'in' ? 'text-emerald-400' : 'text-slate-500']" />
                      <span class="font-bold font-mono">{{ formatCurrency(set.amount) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <StatusBadge :status="set.status as any" size="sm" class="uppercase text-[9px]" />
                  </td>
                  <td class="px-6 py-4 text-xs font-medium text-slate-500">{{ set.eta }}</td>
                  <td class="px-6 py-4 text-right">
                    <BaseButton variant="ghost" size="sm" class="text-slate-600 hover:text-white transition-colors">
                      <ArrowRight class="w-4 h-4" />
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-white/5 bg-white/[0.01] flex justify-center">
            <button class="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
              View All Settlements
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      <!-- Right Column: System Controls -->
      <div class="space-y-8">
        <!-- Floating Orchestrator -->
        <Card title="Float Deployment Console">
          <div class="space-y-6">
            <div class="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-3">
              <Zap class="w-10 h-10 text-indigo-400 mx-auto" />
              <div>
                <h4 class="text-sm font-bold text-white">Manual Liquidity Injection</h4>
                <p class="text-[10px] text-slate-500 mt-1">Directly mint or move float between network tiers.</p>
              </div>
            </div>
            <div class="space-y-4">
              <BaseButton variant="primary" class="w-full" :loading="isOrchestrating" @click="handleBatchSettlement">
                {{ isOrchestrating ? 'Orchestrating...' : 'Initiate Batch Settlement' }}
              </BaseButton>
              <BaseButton variant="secondary" class="w-full border-white/10" @click="handleRebalance">Rebalance Reserves</BaseButton>
            </div>
          </div>
        </Card>

        <!-- Node Health -->
        <Card title="Providore API Health">
          <div class="space-y-4">
            <div v-for="prov in [
              { name: 'BlocPoint Core', status: 'Optimal', latency: '12ms' },
              { name: 'YellowCard API', status: 'Online', latency: '185ms' },
              { name: 'Bank Gateway (NIP)', status: 'Lagging', latency: '2.4s' }
            ]" :key="prov.name" class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div :class="['w-2 h-2 rounded-full', prov.status === 'Optimal' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : prov.status === 'Online' ? 'bg-cyan-500' : 'bg-amber-500 animate-pulse']"></div>
                <div>
                  <h4 class="text-xs font-bold text-white">{{ prov.name }}</h4>
                  <p class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ prov.status }}</p>
                </div>
              </div>
              <span class="text-[10px] font-mono font-bold text-slate-600">{{ prov.latency }}</span>
            </div>
          </div>
        </Card>
      </div>

    </div>

    <!-- Modals & Drawers -->

    <!-- Move Liquidity Modal -->
    <BaseModal :show="showMoveModal" title="Orchestrate Liquidity Move" size="md" @close="showMoveModal = false">
      <div class="space-y-6">
        <div class="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
          <TrendingUp class="w-6 h-6 text-indigo-400" />
          <p class="text-xs text-slate-400">Inter-pool movement requires vault verification. Settlements under ₦10M are processed via T+0 protocol.</p>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase text-slate-500 ml-1">Source Reservoir</label>
              <select v-model="moveForm.source" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option v-for="res in reserves" :key="res.name">{{ res.name }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase text-slate-500 ml-1">Destination Node</label>
              <select v-model="moveForm.destination" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option>Settlement Node A</option>
                <option>Agent Float Reservoir</option>
                <option>Stablecoin Bridge</option>
              </select>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase text-slate-500 ml-1">Deployment Amount (NGN)</label>
            <input v-model="moveForm.amount" type="number" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showMoveModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="isMoving" @click="handleMove">Deploy Liquidity</BaseButton>
      </template>
    </BaseModal>

    <!-- Reserve Limits Modal -->
    <BaseModal :show="showLimitModal" title="Reserve Governance" size="md" @close="showLimitModal = false">
      <div class="space-y-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase text-slate-500 ml-1">Minimum NGN Reserve (Threshold)</label>
            <input v-model="limitForm.ngnThreshold" type="number" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase text-slate-500 ml-1">Minimum USDT Reserve (Threshold)</label>
            <input v-model="limitForm.usdtThreshold" type="number" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showLimitModal = false">Discard</BaseButton>
        <BaseButton variant="primary" :loading="isUpdating" @click="handleUpdateLimits">Apply Governance</BaseButton>
      </template>
    </BaseModal>

    <!-- Settlement Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="selectedSet?.id" 
      description="MDT Settlement Protocol Verification"
      width="lg"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedSet" class="space-y-8">
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div class="flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', selectedSet.direction === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white']">
              <component :is="selectedSet.direction === 'in' ? ArrowDownLeft : ArrowUpRight" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Settlement Amount</div>
              <div class="text-xl font-bold text-white">{{ formatCurrency(selectedSet.amount) }}</div>
            </div>
          </div>
          <StatusBadge :status="selectedSet.status" size="md" />
        </div>

        <div class="space-y-3">
          <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Audit Metadata</h4>
          <Card padding="p-4" class="bg-dark-bg/50 border-white/5">
            <div class="space-y-3 font-mono text-[10px]">
              <div class="flex justify-between">
                <span class="text-slate-600">PROTOCOL</span>
                <span class="text-indigo-400">{{ selectedSet.metadata?.protocol || 'MDT-v2.1' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">REFERENCE</span>
                <span class="text-white">{{ selectedSet.reference || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">LATENCY</span>
                <span class="text-emerald-400">{{ selectedSet.metadata?.latency || '18ms' }}</span>
              </div>
            </div>
          </Card>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full">
             <History class="w-4 h-4 mr-2" /> Audit Trail
           </BaseButton>
           <BaseButton variant="secondary" size="md" class="w-full text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/5">
             <ShieldAlert class="w-4 h-4 mr-2" /> Verify Proof
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" class="w-full" @click="showDetailDrawer = false">Close Protocol View</BaseButton>
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
/* Optional scoped styles */
</style>
