<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Shield, 
  Search, 
  ShieldAlert,
  Server,
  Terminal,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  User,
  Lock,
  ChevronRight,
  Eye,
  FileCode,
  Activity
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'
const search = ref('')
const activeFilter = ref('all')
const showDetailDrawer = ref(false)
const selectedLog = ref<any>(null)
const isExporting = ref(false)

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

const logs = ref([
  { 
    id: 'LOG-8821', 
    action: 'Agent Frozen', 
    actor: 'SuperAdmin (ID: 01)', 
    target: 'John Doe', 
    ip: '192.168.1.1', 
    severity: 'critical', 
    time: '2 mins ago', 
    details: 'Manual suspension due to high risk AML flag. Account balance of ₦ 2.4M restricted.',
    metadata: {
      reason: 'AML Velocity threshold reached',
      approver: 'Security Board',
      source: 'Internal Monitor'
    }
  },
  { 
    id: 'LOG-8820', 
    action: 'Tier Upgrade', 
    actor: 'Compliance Lead', 
    target: 'Sarah Smith', 
    ip: '10.0.4.12', 
    severity: 'medium', 
    time: '15 mins ago', 
    details: 'Upgraded to Tier 3 verified following successful identity sweep.',
    metadata: {
      documents: 'Approved via FIRS verify',
      duration: '450ms'
    }
  },
  { 
    id: 'LOG-8819', 
    action: 'Vault Settlement', 
    actor: 'System (Auto)', 
    target: 'Access Bank', 
    ip: 'internal', 
    severity: 'low', 
    time: '45 mins ago', 
    details: 'Automated settlement sweep completed. Net value transferred: $ 840,200.00.',
    metadata: {
      job_id: 'cron_sh_9921',
      status: '200 OK'
    }
  },
  { 
    id: 'LOG-8818', 
    action: 'API Secret Rotated', 
    actor: 'Security Bot', 
    target: 'Agent X', 
    ip: 'internal', 
    severity: 'high', 
    time: '1h ago', 
    details: 'Periodic credential rotation for production environment stabilization.',
    metadata: {
      encryption: 'AES-256-GCM',
      node: 'auth-cluster-01'
    }
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const q = search.value.toLowerCase()
    const matchesSearch = log.action.toLowerCase().includes(q) || 
                          log.actor.toLowerCase().includes(q) || 
                          log.target.toLowerCase().includes(q) ||
                          log.id.toLowerCase().includes(q)
    
    let matchesFilter = true
    if (activeFilter.value !== 'all') {
      matchesFilter = log.severity === activeFilter.value
    }
    
    return matchesSearch && matchesFilter
  })
})

function openDetail(log: any) {
  selectedLog.value = log
  showDetailDrawer.value = true
}

const handleExport = () => {
  isExporting.value = true
  showNotification('Compiling tamper-proof audit report...', 'info')
  setTimeout(() => {
    isExporting.value = false
    showNotification('Audit report exported (SHA-256 HMAC signed).', 'success')
  }, 2000)
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-rose-400 bg-rose-400/10 border-rose-500/20'
    case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-500/20'
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-500/20'
    default: return 'text-slate-400 bg-white/5 border-white/10'
  }
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield class="w-8 h-8 text-indigo-500" />
          Audit & Integrity Logs
        </h1>
        <p class="text-slate-400 mt-1">Immutable trail of administrative actions and system events.</p>
      </div>
      <BaseButton variant="secondary" size="sm" @click="handleExport" :loading="isExporting">
        <Download class="w-4 h-4 mr-2" />
        Export Audit Report
      </BaseButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card v-for="stat in [
        { label: 'Security Events', value: '1,204', icon: Lock, color: 'text-indigo-400' },
        { label: 'System Uptime', value: '99.99%', icon: Activity, color: 'text-emerald-400' },
        { label: 'Critical Alerts', value: '0', icon: ShieldAlert, color: 'text-rose-400' }
      ]" :key="stat.label" padding="p-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Log View -->
    <div class="space-y-4">
      <!-- Logic Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-md">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input v-model="search" type="text" placeholder="Search by actor, action or target..." class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
        </div>
        <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
          <button 
            v-for="f in ['all', 'critical', 'high', 'medium', 'low']" :key="f"
            @click="activeFilter = f"
            :class="[
              'px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap',
              activeFilter === f ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            ]"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <!-- Log Stream -->
      <div class="space-y-3">
        <div 
          v-for="log in filteredLogs" :key="log.id" 
          class="glass-panel p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group flex items-center gap-6 cursor-pointer"
          @click="openDetail(log)"
        >
          <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-indigo-500/10 transition-colors">
            <Server v-if="log.actor.includes('System')" class="w-5 h-5 text-slate-500" />
            <User v-else class="w-5 h-5 text-indigo-400" />
          </div>
          
          <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div>
              <h4 class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{{ log.action }}</h4>
              <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">{{ log.actor }}</p>
            </div>
            
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target</span>
              <span class="text-xs text-white font-medium">{{ log.target }}</span>
            </div>

            <div>
              <div :class="['inline-flex px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest', getSeverityStyles(log.severity)]">
                {{ log.severity }}
              </div>
            </div>

            <div class="text-right flex flex-col items-end">
              <div class="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                <Clock class="w-3 h-3" />
                {{ log.time }}
              </div>
              <span class="text-[9px] text-slate-700 font-mono mt-1">{{ log.ip }}</span>
            </div>
          </div>

          <div class="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
             <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0 text-slate-500 hover:text-indigo-400">
               <Eye class="w-4 h-4" />
             </BaseButton>
             <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0 text-slate-500 hover:text-indigo-400">
               <FileCode class="w-4 h-4" />
             </BaseButton>
          </div>
        </div>
      </div>

      <div v-if="filteredLogs.length === 0" class="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
        <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search class="w-6 h-6 text-slate-600" />
        </div>
        <h3 class="text-white font-bold">No logs matched your criteria</h3>
        <p class="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
      </div>

      <div class="flex justify-center pt-6">
        <BaseButton variant="secondary" size="md" class="border-white/5 text-slate-600 hover:text-white" @click="showNotification('Retrieving historical audit cluster data...', 'info')">
          Load Historical Data
          <ChevronRight class="w-4 h-4 ml-2" />
        </BaseButton>
      </div>
    </div>

    <!-- Log Detail Drawer -->
    <BaseDrawer 
      :show="showDetailDrawer" 
      :title="`Log Inspection: ${selectedLog?.id}`" 
      description="Immutable action metadata and granular event details"
      @close="showDetailDrawer = false"
    >
      <div v-if="selectedLog" class="space-y-8">
        <div class="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 relative overflow-hidden group">
           <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors"></div>
           <div class="flex justify-between items-start">
              <div :class="['px-3 py-1 rounded-full text-[9px] font-bold uppercase border tracking-widest', getSeverityStyles(selectedLog.severity)]">
                {{ selectedLog.severity }}
              </div>
              <span class="text-[10px] font-mono text-slate-600 tracking-tighter">{{ selectedLog.id }}</span>
           </div>
           <div>
              <h4 class="text-xl font-bold text-white">{{ selectedLog.action }}</h4>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed italic border-l-2 border-indigo-500 pl-4">"{{ selectedLog.details }}"</p>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                <User class="w-3 h-3" /> Actor
              </div>
              <div class="text-xs font-bold text-white">{{ selectedLog.actor }}</div>
           </div>
           <div class="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                 <Monitor class="w-3 h-3" /> IP Address
              </div>
              <div class="text-xs font-bold text-white font-mono uppercase">{{ selectedLog.ip }}</div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Action Context</h4>
           <div class="space-y-3">
              <div v-for="(val, key) in selectedLog.metadata" :key="key" class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                 <span class="text-[10px] font-bold text-slate-500 uppercase">{{ String(key).replace('_', ' ') }}</span>
                 <span class="text-xs font-mono text-white">{{ val }}</span>
              </div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
              Evidence Trail
              <BaseButton variant="ghost" size="sm" class="text-indigo-400 hover:bg-indigo-500/10">
                <Terminal class="w-3 h-3 mr-1.5" /> View Raw JSON
              </BaseButton>
           </h4>
           <div class="p-4 bg-dark-bg/50 border border-white/5 rounded-2xl font-mono text-[11px] text-slate-300 leading-relaxed">
              <div class="text-emerald-500 opacity-50 mb-2">// Integrity Check: Validated by ShieldEngine</div>
              <div>{</div>
              <div class="pl-4">"action": "{{ selectedLog.action }}",</div>
              <div class="pl-4">"timestamp": "{{ new Date().toISOString() }}",</div>
              <div class="pl-4">"hash": "0x{{ selectedLog.id.split('-')[1] }}...8f2b",</div>
              <div class="pl-4">"node": "cluster-node-africa-01"</div>
              <div>}</div>
           </div>
        </div>

        <div class="pt-4 flex gap-3 border-t border-white/5">
           <BaseButton variant="secondary" class="flex-1" @click="showNotification('Audit log flagged for peer review.', 'info')">
             <ShieldAlert class="w-4 h-4 mr-2" /> Flag Entry
           </BaseButton>
           <BaseButton variant="primary" class="flex-1" @click="showNotification('Audit log downloaded successfully.', 'success')">
             <Download class="w-4 h-4 mr-2" /> Export Metadata
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
          <component :is="notification.type === 'success' ? CheckCircle2 : notification.type === 'error' ? AlertTriangle : Activity" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
