<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Settings2, 
  Percent, 
  Coins, 
  ArrowUpRight, 
  Save, 
  RefreshCcw, 
  Search,
  Plus,
  HelpCircle,
  Zap,
  Tag,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  ZapOff,
  Edit2,
  Trash2,
  Info,
  AlertTriangle
} from 'lucide-vue-next'

import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const activeTab = ref('fees')
const search = ref('')
const showRuleModal = ref(false)
const showCommissionDrawer = ref(false)
const selectedRule = ref<any>(null)
const selectedComm = ref<any>(null)

const isPublishing = ref(false)
const isResetting = ref(false)

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

const feeRules = ref([
  { id: 'FR-001', type: 'P2P Transfer', fee_type: 'Percentage', value: '1.5%', min: '₦ 50', max: '₦ 2,500', status: 'active', desc: 'Standard peer-to-peer wallet transfer fee.' },
  { id: 'FR-002', type: 'Cash Out', fee_type: 'Flat', value: '₦ 100', min: '-', max: '-', status: 'active', desc: 'Withdrawal fee for agent-assisted cash out.' },
  { id: 'FR-003', type: 'Stablecoin Swap', fee_type: 'Percentage', value: '0.8%', min: '-', max: '-', status: 'active', desc: 'Internal FX swap margin for USDT/NGN.' },
  { id: 'FR-004', type: 'Merchant Pay', fee_type: 'Percentage', value: '2.0%', min: '₦ 10', max: '₦ 10,000', status: 'inactive', desc: 'B2B merchant settlement fee profile.' }
])

const commissions = ref([
  { id: 'C-001', role: 'Tier 1 Agent', type: 'Deposit', payout: '₦ 50 / TXN', method: 'Instant', volume: '0 - 500k', count: '128' },
  { id: 'C-002', role: 'Tier 2 Agent', type: 'Withdrawal', payout: '0.2%', method: 'Instant', volume: '500k - 5M', count: '42' },
  { id: 'C-003', role: 'Super Agent', type: 'Network Fee Share', payout: '15% of Revenue', method: 'Monthly', volume: '5M+', count: '12' }
])

const filteredFees = computed(() => {
  return feeRules.value.filter(rule => {
    const q = search.value.toLowerCase()
    return rule.type.toLowerCase().includes(q) || rule.id.toLowerCase().includes(q)
  })
})

const handlePublish = () => {
  isPublishing.value = true
  showNotification('Syncing pricing changes to network nodes...', 'info')
  setTimeout(() => {
    isPublishing.value = false
    showNotification('Pricing engine updated successfully (V2.4.1)', 'success')
  }, 2500)
}

const handleReset = () => {
  isResetting.value = true
  setTimeout(() => {
    isResetting.value = false
    showNotification('Pricing defaults restored.', 'info')
  }, 1500)
}

function openRuleModal(rule: any = null) {
  selectedRule.value = rule || { id: 'FR-NEW', type: '', fee_type: 'Percentage', value: '', min: '', max: '', status: 'active' }
  showRuleModal.value = true
}

function openCommDrawer(comm: any) {
  selectedComm.value = comm
  showCommissionDrawer.value = true
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings2 class="w-8 h-8 text-indigo-500" />
          Pricing & Commission Engine
        </h1>
        <p class="text-slate-400 mt-1">Configure transaction fees, agent payouts, and FX margins across the network.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleReset" :loading="isResetting">
          <RefreshCcw class="w-4 h-4 mr-2" />
          Reset Defaults
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handlePublish" :loading="isPublishing">
          <Save class="w-4 h-4 mr-2" />
          Publish Changes
        </BaseButton>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-1 bg-white/5 p-1 rounded-2xl w-fit">
      <button 
        v-for="t in [
          { id: 'fees', label: 'Transaction Fees', icon: Tag },
          { id: 'commissions', label: 'Agent Commissions', icon: Percent },
          { id: 'fx', label: 'FX Margins', icon: Coins }
        ]" :key="t.id"
        @click="activeTab = t.id"
        :class="[
          'flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all',
          activeTab === t.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
        ]"
      >
        <component :is="t.icon" class="w-4 h-4" />
        {{ t.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div v-if="activeTab === 'fees'" class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="relative w-full max-w-md">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input v-model="search" type="text" placeholder="Search rules..." class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <BaseButton variant="primary" size="sm" @click="openRuleModal()">
          <Plus class="w-4 h-4 mr-2" />
          New Pricing Rule
        </BaseButton>
      </div>

      <Card padding="p-0">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/[0.01] border-b border-white/5">
            <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th class="px-6 py-4">Rule ID</th>
              <th class="px-6 py-4">Service Type</th>
              <th class="px-6 py-4">Fee Structure</th>
              <th class="px-6 py-4">Value</th>
              <th class="px-6 py-4">Bounds (Min/Max)</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr v-for="rule in filteredFees" :key="rule.id" class="hover:bg-white/[0.01] transition-colors group">
              <td class="px-6 py-4 font-mono text-xs font-bold text-indigo-400">{{ rule.id }}</td>
              <td class="px-6 py-4 text-xs font-bold text-white">{{ rule.type }}</td>
              <td class="px-6 py-4">
                <span class="text-xs text-slate-400">{{ rule.fee_type }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-white">{{ rule.value }}</span>
              </td>
              <td class="px-6 py-4 font-mono text-[10px] text-slate-500">
                {{ rule.min }} / {{ rule.max }}
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="rule.status as any" size="sm" class="uppercase text-[9px]" />
              </td>
              <td class="px-6 py-4 text-right">
                <BaseButton variant="ghost" size="sm" class="text-slate-500 hover:text-white" @click="openRuleModal(rule)">
                  Edit
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>

    <!-- Commission View -->
    <div v-else-if="activeTab === 'commissions'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <Card v-for="comm in commissions" :key="comm.role + comm.type" class="group hover:border-indigo-500/30 transition-all cursor-pointer" @click="openCommDrawer(comm)">
          <div class="flex justify-between items-start mb-6">
            <div class="p-2.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-indigo-400 group-hover:text-white transition-colors">
              <Percent class="w-5 h-5" />
            </div>
            <div class="text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5 bg-white/5 rounded border border-white/5">{{ comm.method }}</div>
          </div>
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-widest">{{ comm.type }} Payout</h4>
            <p class="text-2xl font-bold text-white mt-1">{{ comm.payout }}</p>
            <p class="text-[10px] text-slate-500 mt-2">Applies to: <span class="text-white font-semibold">{{ comm.role }}</span></p>
          </div>
          <template #footer>
             <BaseButton variant="ghost" size="sm" class="w-full text-indigo-400 hover:text-white transition-colors">
               Modify Policy <ArrowUpRight class="w-3 h-3 ml-2" />
             </BaseButton>
          </template>
       </Card>
       <div 
        class="border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer group"
        @click="showNotification('Opening policy designer...', 'info')"
      >
          <Plus class="w-8 h-8 text-slate-500 group-hover:text-indigo-400" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-400">New Payout Tier</span>
       </div>
    </div>

    <!-- Modals & Drawers -->

    <!-- Rule Configuration Modal -->
    <BaseModal 
      :show="showRuleModal" 
      @close="showRuleModal = false"
      title="Pricing Rule Configuration" 
      description="Define transaction fees and threshold bounds for network services."
    >
      <div v-if="selectedRule" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
           <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Service Type</label>
              <input v-model="selectedRule.type" type="text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" placeholder="e.g. Wallet Swap" />
           </div>
           <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fee Type</label>
              <select v-model="selectedRule.fee_type" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
                <option>Percentage</option>
                <option>Flat Fee</option>
              </select>
           </div>
        </div>
        <div class="space-y-2">
           <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fee Value</label>
           <div class="relative">
              <input v-model="selectedRule.value" type="text" class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-bold" />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><Tag class="w-4 h-4" /></div>
           </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
             <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Min. Bound</label>
             <input v-model="selectedRule.min" type="text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" />
          </div>
          <div class="space-y-2">
             <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Max. Bound</label>
             <input v-model="selectedRule.max" type="text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" />
          </div>
        </div>
        <div class="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
           <Info class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
           <p class="text-[10px] text-slate-400 italic">Rules are applied to the gross transaction volume before agent commission splits.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-between w-full">
           <BaseButton variant="secondary" @click="showNotification('Rule archive requested.', 'error')"><Trash2 class="w-4 h-4 mr-2" /> Delete</BaseButton>
           <BaseButton variant="primary" class="flex-1" @click="showNotification('Pricing rule parameters saved.', 'success'); showRuleModal = false">Update Rule</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Commission Policy Drawer -->
    <BaseDrawer 
      :show="showCommissionDrawer" 
      :title="`Policy Designer: ${selectedComm?.role}`" 
      description="Agent incentive structure and volume-based payout scaling."
      @close="showCommissionDrawer = false"
    >
      <div v-if="selectedComm" class="space-y-8">
         <div class="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
            <div class="flex justify-between items-center">
               <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                     <Percent class="w-6 h-6" />
                  </div>
                  <div>
                     <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Policy</h4>
                     <p class="text-sm font-bold text-white">{{ selectedComm.role }} - {{ selectedComm.type }}</p>
                  </div>
               </div>
               <div class="text-[10px] font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10 uppercase font-mono">{{ selectedComm.method }}</div>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4">
            <Card padding="p-4">
               <div class="text-[9px] font-bold text-slate-500 uppercase mb-1">Current Payout</div>
               <div class="text-xl font-bold text-white font-mono leading-none tracking-tight">{{ selectedComm.payout }}</div>
            </Card>
            <Card padding="p-4">
               <div class="text-[9px] font-bold text-slate-500 uppercase mb-1">Volume Tier</div>
               <div class="text-xl font-bold text-white font-mono leading-none tracking-tight uppercase">{{ selectedComm.volume }}</div>
            </Card>
         </div>

         <div class="space-y-4">
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Policy Performance</h4>
            <div class="p-5 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between">
               <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                     <TrendingUp class="w-5 h-5" />
                  </div>
                  <div>
                     <div class="text-xs font-bold text-white">{{ selectedComm.count }} Agents</div>
                     <div class="text-[10px] text-slate-500">Currently enrolled in this tier</div>
                  </div>
               </div>
               <BaseButton variant="ghost" size="sm" class="text-indigo-400">
                  Manage <ArrowUpRight class="w-3 h-3 ml-2" />
               </BaseButton>
            </div>
         </div>

         <div class="space-y-4 pt-4 border-t border-white/10">
            <div class="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl hover:bg-rose-500/10 transition-colors cursor-pointer group">
               <div class="flex items-center gap-3">
                  <ZapOff class="w-5 h-5 text-rose-500" />
                  <div>
                     <div class="text-xs font-bold text-white">Emergency Suspension</div>
                     <div class="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">Disable policy globally</div>
                  </div>
               </div>
               <ChevronRight class="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <BaseButton variant="primary" class="w-full py-4 text-sm" @click="showNotification('Policy revisions queued.', 'success'); showCommissionDrawer = false">
               <Edit2 class="w-4 h-4 mr-2" /> Edit Policy Structure
            </BaseButton>
         </div>
      </div>
    </BaseDrawer>

    <!-- Notification -->
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
          <component :is="notification.type === 'success' ? ShieldCheck : notification.type === 'error' ? AlertTriangle : Info" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>

    <!-- Pricing Integrity Alert -->
    <div class="glass-panel p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-6">
       <div class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
         <Zap class="w-6 h-6" />
       </div>
       <div class="flex-1">
         <h4 class="text-sm font-bold text-white">Dynamic Pricing Active</h4>
         <p class="text-xs text-slate-500 mt-1">Changes published to the Pricing Engine are reflected across all network nodes within 45 seconds.</p>
       </div>
       <BaseButton variant="secondary" size="sm" class="shrink-0">
          <HelpCircle class="w-4 h-4 mr-2" /> Learn More
       </BaseButton>
    </div>
  </div>
</template>

<style scoped>
</style>
