<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ShieldAlert, 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Ban,
  Download,
  Activity,
  FileText,
  Settings,
  MoreVertical,
  CheckCircle2,
  XCircle,
  BarChart3,
  ExternalLink
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

// State Management
const activeQueue = ref('kyc_queue')
const search = ref('')
const showDetailDrawer = ref(false)
const showSettingsModal = ref(false)
const selectedEntity = ref<any>(null)

const isExporting = ref(false)
const isBulkApproving = ref(false)

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

const complianceStats = [
  { label: 'Pending Verification', value: '42', color: 'text-amber-400', icon: Clock },
  { label: 'High Risk Alerts', value: '7', color: 'text-red-400', icon: ShieldAlert },
  { label: 'Verified Today', value: '128', color: 'text-emerald-400', icon: ShieldCheck },
  { label: 'Flagged Transactions', value: '18', color: 'text-rose-400', icon: Activity }
]

const verificationQueue = ref([
  { 
    id: 'kyc_8912', 
    entity: 'Apex Logistics', 
    type: 'Business (KYB)', 
    risk: 'Low', 
    submitted: '2h ago', 
    status: 'pending',
    category: 'kyc_queue',
    details: 'Standard business onboarding. All primary documents submitted.',
    documents: ['Registration Cert', 'Tax ID', 'Director IDs'],
    flags: []
  },
  { 
    id: 'kyc_8911', 
    entity: 'Sarah Williams', 
    type: 'Individual (KYC)', 
    risk: 'Medium', 
    submitted: '5h ago', 
    status: 'in_review',
    category: 'kyc_queue',
    details: 'Address verification mismatch. Manual review required for utility bill.',
    documents: ['Passport', 'Utility Bill'],
    flags: ['Address Mismatch']
  },
  { 
    id: 'aml_4402', 
    entity: 'Unknown Flow #88', 
    type: 'Sanction Hit', 
    risk: 'High', 
    submitted: '12h ago', 
    status: 'flagged',
    category: 'aml_alerts',
    details: 'Potential match with OFAC SDN list for "Alpha Group". Correlating metadata.',
    documents: ['Transaction Hash', 'IP Log'],
    flags: ['Sanction Hit', 'High Velocity']
  },
  { 
    id: 'kyc_8908', 
    entity: 'Global Trade Ind.', 
    type: 'Business (KYB)', 
    risk: 'Low', 
    submitted: '1d ago', 
    status: 'pending',
    category: 'kyc_queue',
    details: 'Re-verification of expiring tax documents.',
    documents: ['Updated Tax Cert'],
    flags: []
  },
  {
    id: 'sus_1102',
    entity: 'James Bond Trading',
    type: 'Agent (KYA)',
    risk: 'High',
    submitted: '15m ago',
    status: 'flagged',
    category: 'suspension_desk',
    details: 'Suspicious login pattern from multiple countries within 5 minutes.',
    documents: ['Device Fingerprint', 'Login History'],
    flags: ['Impossible Travel']
  }
])

const filteredQueue = computed(() => {
  return verificationQueue.value.filter(item => {
    const q = search.value.toLowerCase()
    const matchesSearch = item.entity.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    
    let matchesTab = true
    if (activeQueue.value === 'kyc_queue') matchesTab = item.category === 'kyc_queue'
    else if (activeQueue.value === 'aml_alerts') matchesTab = item.category === 'aml_alerts'
    else if (activeQueue.value === 'suspension_desk') matchesTab = item.category === 'suspension_desk'
    
    return matchesSearch && matchesTab
  })
})

const handleExport = () => {
  isExporting.value = true
  showNotification('Generating detailed compliance audit log...', 'info')
  setTimeout(() => {
    isExporting.value = false
    showNotification('Audit log exported successfully (CSV).', 'success')
  }, 2000)
}

const handleBulkApprove = () => {
  isBulkApproving.value = true
  setTimeout(() => {
    isBulkApproving.value = false
    showNotification('Bulk approval of 12 Low-Risk Kyc entities completed.', 'success')
  }, 1500)
}

function openDetail(item: any) {
  selectedEntity.value = item
  showDetailDrawer.value = true
}

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  }
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Compliance & Risk</h1>
        <p class="text-slate-400 mt-1">Monitor KYC/KYB pipelines and automate AML detection workflows.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleExport" :loading="isExporting">
          <Download class="w-4 h-4 mr-2" />
          Export Audit Log
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="showSettingsModal = true">
          <Settings class="w-4 h-4 mr-2" />
          Queue Settings
        </BaseButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in complianceStats" :key="stat.label" class="relative overflow-hidden">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </Card>
    </div>

    <!-- Main Operational View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Verification Queue (Left 2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            <button 
              v-for="q in ['KYC Queue', 'AML Alerts', 'Suspension Desk']" :key="q"
              :class="[
                'px-4 py-2 text-xs font-bold rounded-lg transition-all',
                activeQueue === q.toLowerCase().replace(' ', '_') ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              ]"
              @click="activeQueue = q.toLowerCase().replace(' ', '_')"
            >
              {{ q }}
            </button>
          </div>
          <div class="relative w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              v-model="search"
              type="text" 
              placeholder="Filter queue..." 
              class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div class="space-y-3">
          <Card 
            v-for="item in filteredQueue" :key="item.id" 
            padding="p-0" 
            class="group cursor-pointer hover:bg-white/[0.02] transition-all border-l-4"
            :style="{ borderLeftColor: item.risk === 'High' ? '#ef4444' : item.risk === 'Medium' ? '#f59e0b' : '#10b981' }"
            @click="openDetail(item)"
          >
            <div class="p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-mono text-xs text-slate-500">
                  {{ item.id.split('_')[1] }}
                </div>
                <div>
                  <h4 class="font-bold text-white flex items-center gap-2">
                    {{ item.entity }}
                    <span v-if="item.status === 'flagged'" class="p-1 bg-red-500/10 rounded-full">
                      <ShieldAlert class="w-3 h-3 text-red-400" />
                    </span>
                  </h4>
                  <p class="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 uppercase tracking-wider font-semibold">
                    {{ item.type }} • Submitted {{ item.submitted }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="hidden sm:flex flex-col items-end">
                  <span class="text-[10px] text-slate-500 font-bold uppercase mb-1">Risk Level</span>
                  <span :class="['px-2 py-0.5 rounded text-[10px] font-bold border uppercase', getRiskColor(item.risk)]">
                    {{ item.risk }}
                  </span>
                </div>
                <div class="hidden sm:flex flex-col items-end min-w-[100px]">
                  <span class="text-[10px] text-slate-500 font-bold uppercase mb-1">Workflow Status</span>
                  <StatusBadge :status="item.status as any" class="scale-90 origin-right" />
                </div>
                <BaseButton variant="ghost" size="sm" class="h-10 w-10 p-0 text-slate-500 hover:text-indigo-400">
                  <ChevronRight class="w-5 h-5" />
                </BaseButton>
              </div>
            </div>
          </Card>
        </div>

        <div class="flex items-center justify-center pt-4">
          <BaseButton variant="ghost" size="sm" class="text-xs text-slate-500">Load Older Records</BaseButton>
        </div>
      </div>

      <!-- Right Sidebar (Risk Analysis) -->
      <div class="space-y-8">
        <Card title="Risk Distribution">
          <div class="space-y-4">
            <div v-for="level in [
              { label: 'Low Risk', count: 120, percent: 85, color: 'bg-emerald-500' },
              { label: 'Medium Risk', count: 18, percent: 12, color: 'bg-amber-500' },
              { label: 'High Risk / Flagged', count: 4, percent: 3, color: 'bg-rose-500' }
            ]" :key="level.label" class="space-y-1.5">
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span class="text-slate-400">{{ level.label }}</span>
                <span class="text-white">{{ level.count }} entities</span>
              </div>
              <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000" :class="level.color" :style="{ width: level.percent + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <p class="text-xs text-indigo-300 leading-relaxed italic">
              "System has flagged a 3% increase in High Risk entities from the South Asia corridor. Recommend secondary review."
            </p>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div class="space-y-3">
            <BaseButton variant="secondary" size="md" class="w-full justify-start text-xs font-bold" @click="showNotification('Blacklist context menu opened.', 'info')">
              <Ban class="w-4 h-4 mr-3 text-red-500" />
              Blacklist Entity
            </BaseButton>
            <BaseButton variant="secondary" size="md" class="w-full justify-start text-xs font-bold" @click="showNotification('Risk report dispatched to master-node.', 'success')">
              <AlertTriangle class="w-4 h-4 mr-3 text-amber-500" />
              Report to Compliance
            </BaseButton>
            <BaseButton variant="secondary" size="md" class="w-full justify-start text-xs font-bold" @click="handleBulkApprove" :loading="isBulkApproving">
              <UserCheck class="w-4 h-4 mr-3 text-emerald-500" />
              Bulk Approve KYC
            </BaseButton>
          </div>
        </Card>
      </div>

    </div>

    <!-- Modals & Drawers -->

    <!-- Queue Settings Modal -->
    <BaseModal 
      :show="showSettingsModal" 
      @close="showSettingsModal = false"
      title="Compliance Queue Engine" 
      description="Configure triage thresholds and automated verification routing."
    >
      <div class="space-y-6">
        <div class="space-y-3">
          <div v-for="setting in [
            { label: 'Auto-Approve Low Risk', enabled: true },
            { label: 'Escalate Sanction Hits', enabled: true },
            { label: 'Enable Behavioral AI Scoring', enabled: false }
          ]" :key="setting.label" class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span class="text-xs font-medium text-white">{{ setting.label }}</span>
            <div :class="['w-8 h-4 rounded-full relative transition-colors cursor-pointer', setting.enabled ? 'bg-indigo-500' : 'bg-slate-700']">
              <div :class="['absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', setting.enabled ? 'left-4.5' : 'left-0.5']"></div>
            </div>
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Verification Corridor</label>
          <select class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
            <option>Global (Default)</option>
            <option>Sub-Saharan Africa</option>
            <option>EU / North America</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" class="w-full" @click="showSettingsModal = false">Save Configuration</BaseButton>
      </template>
    </BaseModal>

    <!-- Verification Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="`Entity Review: ${selectedEntity?.entity}`" 
      description="Operational triage and document verification portal"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedEntity" class="space-y-8">
        <div class="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
           <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                 <div class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {{ selectedEntity.entity[0] }}
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider">{{ selectedEntity.id }}</h4>
                    <p class="text-[10px] text-slate-400">{{ selectedEntity.type }}</p>
                 </div>
              </div>
              <StatusBadge :status="selectedEntity.status" size="md" />
           </div>
           <p class="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">"{{ selectedEntity.details }}"</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Risk Assessment</div>
              <div :class="['text-xl font-bold font-mono', selectedEntity.risk === 'High' ? 'text-rose-400' : 'text-emerald-400']">{{ selectedEntity.risk }}</div>
           </div>
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Queue Age</div>
              <div class="text-xl font-bold text-white font-mono uppercase">{{ selectedEntity.submitted }}</div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Document Inventory</h4>
           <div class="space-y-2">
              <div v-for="doc in selectedEntity.documents" :key="doc" class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-indigo-500/20 transition-all cursor-pointer">
                 <div class="flex items-center gap-3">
                    <FileText class="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span class="text-xs font-bold text-white">{{ doc }}</span>
                 </div>
                 <div class="text-[10px] text-indigo-400 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    View <ChevronRight class="w-3 h-3" />
                 </div>
              </div>
           </div>
        </div>

        <div v-if="selectedEntity.flags.length" class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-rose-400">Security Flags</h4>
           <div class="flex flex-wrap gap-2">
              <span v-for="flag in selectedEntity.flags" :key="flag" class="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold uppercase">
                {{ flag }}
              </span>
           </div>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="primary" class="w-full" @click="showNotification('Entity verified and authorized.', 'success'); showDetailDrawer = false">
             <CheckCircle2 class="w-4 h-4 mr-2" /> Approve
           </BaseButton>
           <BaseButton variant="secondary" class="w-full text-rose-400 border-rose-500/20 hover:bg-rose-500/5" @click="showNotification('Verification rejected. Ticket escalted.', 'error'); showDetailDrawer = false">
             <XCircle class="w-4 h-4 mr-2" /> Reject
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
