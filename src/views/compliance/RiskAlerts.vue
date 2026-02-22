<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ShieldAlert, 
  Search, 
  Clock,
  ShieldCheck,
  Ban,
  Activity,
  AlertTriangle,
  UserX,
  Eye,
  Flag,
  ChevronRight,
  Monitor,
  Database,
  Lock,
  ExternalLink,
  History,
  TrendingUp,
  AlertOctagon,
  Zap
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const activeFilter = ref('pending')
const showDetailDrawer = ref(false)
const showFreezeModal = ref(false)
const showRulesModal = ref(false)
const selectedAlert = ref<any>(null)

const isDownloading = ref(false)

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

const alerts = ref([
  { 
    id: 'AL-9901', 
    type: 'Velocity Spike', 
    entity: 'John Doe', 
    score: 82, 
    status: 'pending', 
    time: '12 mins ago', 
    source: 'POS-8821', 
    description: 'Transaction volume exceeded 300% of MADT within 60 mins',
    impact: '$ 12,400.00',
    geo: 'Lagos, NG',
    device: 'iPhone 15 Pro',
    history: ['Flagged for Velocity (2025)', 'Low Risk (2024)']
  },
  { 
    id: 'AL-9902', 
    type: 'IP Mismatch', 
    entity: 'Sarah Smith', 
    score: 45, 
    status: 'investigating', 
    time: '45 mins ago', 
    source: 'Web-Admin', 
    description: 'Login attempt from previously unknown geo-location (Russia)',
    impact: 'Session Hijack Risk',
    geo: 'Moscow, RU',
    device: 'Chrome / Windows',
    history: ['N/A']
  },
  { 
    id: 'AL-9903', 
    type: 'Structuring Attempt', 
    entity: 'Agent X', 
    score: 91, 
    status: 'high_risk', 
    time: '1h ago', 
    source: 'API-Relay', 
    description: 'Multiple sequential transactions just below notification threshold',
    impact: '₦ 4.5M Aggregate',
    geo: 'Abuja, NG',
    device: 'Automated Scripting',
    history: ['Suspended in 2023 for Structuring']
  }
])

const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    const q = search.value.toLowerCase()
    const matchesSearch = alert.entity.toLowerCase().includes(q) || alert.id.toLowerCase().includes(q)
    
    let matchesTab = true
    if (activeFilter.value === 'pending') matchesTab = alert.status === 'pending'
    else if (activeFilter.value === 'high_risk') matchesTab = alert.status === 'high_risk'
    else if (activeFilter.value === 'resolved') matchesTab = alert.status === 'resolved'
    
    return matchesSearch && matchesTab
  })
})

function openDetail(alert: any) {
  selectedAlert.value = alert
  showDetailDrawer.value = true
}

function openFreeze(alert: any) {
  selectedAlert.value = alert
  showFreezeModal.value = true
}

const downloadIntegrity = () => {
  isDownloading.value = true
  showNotification('Compiling real-time threat integrity report...', 'info')
  setTimeout(() => {
    isDownloading.value = false
    showNotification('Integrity report (PDF) generated successfully.', 'success')
  }, 2000)
}

const getScoreColor = (score: number) => {
  if (score > 80) return 'text-rose-400 bg-rose-400/10 border-rose-500/20'
  if (score > 50) return 'text-amber-400 bg-amber-400/10 border-amber-500/20'
  return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20'
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8 text-white">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert class="w-8 h-8 text-rose-500" />
          Risk Security Console
        </h1>
        <p class="text-slate-400 mt-1">Real-time fraud detection and AML alert orchestration.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="showRulesModal = true">
          <Flag class="w-4 h-4 mr-2 text-indigo-400" />
          Rules Engine
        </BaseButton>
      </div>
    </div>

    <!-- Alert Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card v-for="stat in [
        { label: 'Pending Triage', value: '12', color: 'text-rose-400', icon: ShieldAlert },
        { label: 'Investigating', value: '45', color: 'text-amber-400', icon: Activity },
        { label: 'Rules Triggered', value: '2.4k', color: 'text-indigo-400', icon: Activity },
        { label: 'Threats Blocked', value: '184', color: 'text-emerald-400', icon: ShieldCheck }
      ]" :key="stat.label">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ stat.label }}</span>
          <div class="flex items-center justify-between mt-1">
            <span :class="['text-2xl font-bold', stat.color]">{{ stat.value }}</span>
            <component :is="stat.icon" :class="['w-5 h-5 opacity-20', stat.color]" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Main View -->
    <div class="space-y-4">
      <!-- Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            v-for="f in ['Pending', 'High Risk', 'Resolved']" :key="f"
            @click="activeFilter = f.toLowerCase().replace(' ', '_')"
            :class="['px-4 py-1.5 text-xs font-bold rounded-lg transition-all', activeFilter === f.toLowerCase().replace(' ', '_') ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300']"
          >
            {{ f }}
          </button>
        </div>
        <div class="relative w-full sm:w-64">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input v-model="search" type="text" placeholder="Search entity or alert ID..." class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
      </div>

      <!-- Alert Stream -->
      <div class="space-y-4">
        <div v-for="alert in filteredAlerts" :key="alert.id" class="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
          <div class="flex flex-col lg:flex-row lg:items-center gap-6">
            <!-- Score Gauge -->
            <div :class="['w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all group-hover:scale-105', getScoreColor(alert.score)]">
              <span class="text-xl font-bold">{{ alert.score }}</span>
              <span class="text-[8px] font-bold uppercase trekking-tighter">Risk</span>
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    {{ alert.type }}
                    <span class="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">{{ alert.id }}</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">Impacted Entity: <span class="text-white font-semibold">{{ alert.entity }}</span></p>
                </div>
                <div class="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                  <span class="flex items-center gap-1.5"><Activity class="w-3 h-3" /> {{ alert.source }}</span>
                  <span class="flex items-center gap-1.5"><Clock class="w-3 h-3" /> {{ alert.time }}</span>
                </div>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed max-w-2xl line-clamp-1 italic">"{{ alert.description }}"</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 lg:border-l lg:border-white/5 lg:pl-6">
               <BaseButton variant="secondary" size="sm" class="h-10" @click="openDetail(alert)">
                 <Eye class="w-4 h-4 mr-2" /> Detail
               </BaseButton>
               <BaseButton variant="ghost" size="sm" class="h-10 hover:bg-rose-500/10 hover:text-rose-400" @click="openFreeze(alert)">
                 <UserX class="w-4 h-4 mr-2" /> Freeze
               </BaseButton>
               <BaseButton variant="ghost" size="sm" class="h-10 text-slate-600" @click="showNotification('Alert archived.', 'info')">
                 <Ban class="w-4 h-4" />
               </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-white">End of Priority Stream</h4>
          <p class="text-xs text-slate-500 mt-1">Only displaying active and high-risk alerts from the last session cycle.</p>
        </div>
        <BaseButton variant="secondary" size="sm" @click="downloadIntegrity" :loading="isDownloading">Download Integrity Report</BaseButton>
      </div>
    </div>

    <!-- Modals & Drawers -->

    <!-- Rules Engine Modal -->
    <BaseModal 
      :show="showRulesModal" 
      @close="showRulesModal = false"
      title="Fraud Rules Engine" 
      description="System-wide AML and transaction velocity monitoring parameters."
      width="lg"
    >
      <div class="space-y-4">
        <div v-for="rule in [
          { name: 'Velocity Threshold (60m)', value: '300% MADT', active: true },
          { label: 'Login Country Mismatch', value: 'High Severity', active: true },
          { label: 'Structuring Detection', value: '₦ 50k - ₦ 1m Range', active: false }
        ]" :key="rule.name" class="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
           <div>
              <div class="text-xs font-bold text-white">{{ rule.name || rule.label }}</div>
              <div class="text-[9px] text-slate-500 uppercase font-mono mt-0.5 tracking-widest">{{ rule.value }}</div>
           </div>
           <StatusBadge :status="rule.active ? 'active' : 'inactive'" size="xs" />
        </div>
        <BaseButton variant="primary" class="w-full mt-4">
           <Zap class="w-4 h-4 mr-2" /> Deploy Revised Rules
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Freeze Confirmation Modal -->
    <BaseModal 
      :show="showFreezeModal" 
      @close="showFreezeModal = false"
      title="Secure Lockdown" 
      description="Authorize emergency suspension of all financial corridors for the target entity."
    >
      <div v-if="selectedAlert" class="space-y-4">
        <div class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-4">
           <AlertOctagon class="w-6 h-6 text-rose-500 shrink-0" />
           <div class="text-xs">
              <span class="font-bold text-white uppercase block mb-1">Impact Analysis</span>
              <p class="text-slate-400 leading-relaxed">Freezing <span class="text-white font-bold">{{ selectedAlert.entity }}</span> will block all transfers, withdrawals, and API-triggered swaps effective immediately.</p>
           </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reason for Suspension</label>
          <textarea placeholder="e.g. Confirmed structuring attempt identified in AL-9903" class="w-full h-24 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="secondary" @click="showFreezeModal = false">Abort</BaseButton>
          <BaseButton variant="primary" class="bg-rose-500 hover:bg-rose-600 border-none" @click="showNotification('Account lockdown successful.', 'error'); showFreezeModal = false">
             Confirm Lockdown
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Alert Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="`Alert Insight: ${selectedAlert?.id}`" 
      description="Risk decomposition and behavioral forensics"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedAlert" class="space-y-8">
        <div class="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
           <div>
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Severity</div>
              <div :class="['text-3xl font-bold font-mono', getScoreColor(selectedAlert.score).split(' ')[0]]">{{ selectedAlert.score }}</div>
           </div>
           <div class="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 flex items-center justify-center text-rose-500">
              <TrendingUp class="w-8 h-8" />
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10 group overflow-hidden relative">
              <div class="absolute -right-2 -top-2 text-white/5 group-hover:text-amber-500/10 transition-colors">
                 <History class="w-16 h-16" />
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Financial Impact</div>
              <div class="text-lg font-bold text-white font-mono leading-none">{{ selectedAlert.impact }}</div>
           </div>
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10 group overflow-hidden relative">
              <div class="absolute -right-2 -top-2 text-white/5 group-hover:text-indigo-500/10 transition-colors">
                 <Monitor class="w-16 h-16" />
              </div>
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Origin Node</div>
              <div class="text-lg font-bold text-white font-mono leading-none">{{ selectedAlert.geo }}</div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Threat Context</h4>
           <div class="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
              <p class="text-xs text-slate-400 italic leading-relaxed">"{{ selectedAlert.description }}"</p>
              <div class="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px]">
                 <div>
                    <span class="block text-slate-500 font-bold uppercase mb-0.5">Device Trust</span>
                    <span class="text-white">{{ selectedAlert.device }}</span>
                 </div>
                 <div class="text-right">
                    <span class="block text-slate-500 font-bold uppercase mb-0.5">Trigger Node</span>
                    <span class="text-white">{{ selectedAlert.source }}</span>
                 </div>
              </div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Historical Flags</h4>
           <div class="space-y-2">
              <div v-for="h in selectedAlert.history" :key="h" class="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-300">
                 <Clock class="w-4 h-4 text-slate-500" />
                 {{ h }}
              </div>
           </div>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="primary" class="w-full" @click="showNotification('Alert dismissed. Entity normalized.', 'success'); showDetailDrawer = false">
             <ShieldCheck class="w-4 h-4 mr-2" /> False Alarm
           </BaseButton>
           <BaseButton variant="secondary" class="w-full bg-rose-500/10 border-rose-500/20 text-rose-400" @click="openFreeze(selectedAlert); showDetailDrawer = false">
             <Lock class="w-4 h-4 mr-2" /> Secure Lockdown
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
          <component :is="notification.type === 'success' ? ShieldCheck : notification.type === 'error' ? AlertTriangle : Activity" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
