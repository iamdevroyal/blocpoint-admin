<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Scale, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Database,
  Building2,
  Filter,
  Search,
  Zap,
  History,
  ShieldAlert,
  ChevronRight,
  Activity,
  FileText,
  AlertTriangle,
  TrendingUp,
  Cpu,
  ShieldCheck
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const activeTab = ref('active_queue')
const showInvestigateDrawer = ref(false)
const selectedEx = ref<any>(null)
const isIngesting = ref(false)
const isReconSweeping = ref(false)
const isArchiving = ref(false)
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

const reconciliationStats = [
  { label: 'Network Ledger', value: '₦ 1,842.1M', icon: Database, color: 'text-indigo-400' },
  { label: 'Bank Aggregate', value: '₦ 1,841.9M', icon: Building2, color: 'text-emerald-400' },
  { label: 'Reconciliation Gap', value: '₦ 214.2k', icon: AlertCircle, color: 'text-rose-400' }
]

const exceptions = ref([
  { id: 'EX-001', type: 'Mismatch', internal: 150000.00, external: 148500.00, date: '2026-02-21', source: 'Zenith NIP', status: 'high_risk', category: 'active_queue', details: 'Internal ledger shows ₦150k disbursement, but bank statement confirmed only ₦148.5k settled.' },
  { id: 'EX-002', type: 'Orphaned', internal: 4200.00, external: 0.00, date: '2026-02-21', source: 'Kuda Settlement', status: 'investigating', category: 'active_queue', details: 'Transaction exists in internal ledger but missing from Kuda electronic statement.' },
  { id: 'EX-003', type: 'Delayed', internal: 0.00, external: 25000.00, date: '2026-02-20', source: 'Access Bank', status: 'pending', category: 'active_queue', details: 'Inflow of ₦25k seen in Access Bank but no corresponding internal ledger entry found.' },
  { id: 'EX-004', type: 'Perfect Match', internal: 5000.00, external: 5000.00, date: '2026-02-19', source: 'Standard Chartered', status: 'completed', category: 'resolved', details: 'Fully reconciled and anchored.' }
])

const filteredExceptions = computed(() => {
  return exceptions.value.filter(ex => {
    const q = search.value.toLowerCase()
    const matchesSearch = ex.id.toLowerCase().includes(q) || 
                         ex.source.toLowerCase().includes(q) ||
                         ex.type.toLowerCase().includes(q)
    
    let matchesTab = true
    if (activeTab.value === 'active_queue') matchesTab = ex.category === 'active_queue'
    else if (activeTab.value === 'all_events') matchesTab = true
    else if (activeTab.value === 'resolved') matchesTab = ex.category === 'resolved'
    
    return matchesSearch && matchesTab
  })
})

const handleIngest = () => {
  isIngesting.value = true
  showNotification('Parsing external bank statement...', 'info')
  setTimeout(() => {
    isIngesting.value = false
    showNotification('Statement ingested. 142 matches found, 2 new exceptions.', 'success')
  }, 2000)
}

const handleArchive = () => {
  isArchiving.value = true
  setTimeout(() => {
    isArchiving.value = false
    showNotification('Resolved records moved to cold storage archive.', 'success')
  }, 1000)
}

const handleReconSweep = () => {
  isReconSweeping.value = true
  showNotification('Running algorithmic cross-check...', 'info')
  setTimeout(() => {
    isReconSweeping.value = false
    showNotification('Reconciliation sweep complete. System integrity at 94.2%', 'success')
  }, 2500)
}

const handleDownloadAudit = () => {
  isDownloading.value = true
  showNotification('Generating cryptographic audit trail...', 'info')
  
  setTimeout(() => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Reference ID,Internal,External,Delta,Status,Source,Date\n"
      + exceptions.value.map(ex => `${ex.id},${ex.internal},${ex.external},${Math.abs(ex.internal - ex.external)},${ex.status},${ex.source},${ex.date}`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `audit_trail_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    isDownloading.value = false
    showNotification('Audit trail downloaded successfully', 'success')
  }, 1500)
}

function investigate(ex: any) {
  selectedEx.value = ex
  showInvestigateDrawer.value = true
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
          <Scale class="w-8 h-8 text-emerald-500" />
          Financial Reconciliation
        </h1>
        <p class="text-slate-400 mt-1">Cross-check internal ledger state against external bank and provider statements.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="handleArchive" :loading="isArchiving">
          <History class="w-4 h-4 mr-2" />
          Archive
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleIngest" :loading="isIngesting">
          <UploadCloud class="w-4 h-4 mr-2" />
          Ingest Statement
        </BaseButton>
      </div>
    </div>

    <!-- Integrity Gauge -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card v-for="stat in reconciliationStats" :key="stat.label" padding="p-5" class="relative overflow-hidden group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5 font-mono">{{ stat.value }}</p>
          </div>
        </div>
        <div v-if="stat.label.includes('Gap') && stat.value !== '₦ 0.00'" class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold">
          <AlertCircle class="w-3 h-3" />
          Attention Required
        </div>
      </Card>
    </div>

    <!-- Main View -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Exceptions List (Left 2/3) -->
      <div class="xl:col-span-2 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-2xl gap-4">
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            <button 
              v-for="t in ['Active Queue', 'All Events', 'Resolved']" :key="t"
              @click="activeTab = t.toLowerCase().replace(' ', '_')"
              :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap', activeTab === t.toLowerCase().replace(' ', '_') ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300']"
            >
              {{ t }}
            </button>
          </div>
          <div class="flex gap-2 px-1 pb-1 lg:p-0">
            <div class="relative flex-1 lg:max-w-xs">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input 
                v-model="search"
                type="text" 
                placeholder="Search exceptions..." 
                class="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" 
              />
            </div>
            <BaseButton variant="secondary" size="sm" class="px-2 shrink-0">
              <Filter class="w-3.5 h-3.5" />
            </BaseButton>
          </div>
        </div>

        <Card title="Ledger Exceptions & Discrepancies" padding="p-0">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-white/[0.01] border-b border-white/5">
                <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th class="px-6 py-4">Ref ID</th>
                  <th class="px-6 py-4">Internal</th>
                  <th class="px-6 py-4">External</th>
                  <th class="px-6 py-4">Delta</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300 text-xs">
                <tr v-for="ex in filteredExceptions" :key="ex.id" class="hover:bg-white/[0.01] transition-colors group cursor-pointer" @click="investigate(ex)">
                  <td class="px-6 py-4">
                    <div class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ ex.id }}</div>
                    <div class="text-[9px] text-slate-600 font-mono mt-0.5">{{ ex.source }} • {{ ex.date }}</div>
                  </td>
                  <td class="px-6 py-4 font-mono">{{ formatCurrency(ex.internal) }}</td>
                  <td class="px-6 py-4 font-mono">{{ formatCurrency(ex.external) }}</td>
                  <td class="px-6 py-4">
                    <span :class="['font-bold font-mono', Math.abs(ex.internal - ex.external) > 0 ? 'text-rose-400' : 'text-emerald-400']">
                      {{ formatCurrency(Math.abs(ex.internal - ex.external)) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <StatusBadge :status="ex.status as any" size="sm" class="uppercase text-[8px]" />
                  </td>
                  <td class="px-6 py-4 text-right">
                    <BaseButton variant="ghost" size="sm" class="text-indigo-400 hover:text-white transition-opacity group-hover:opacity-100 opacity-0">
                      Investigate <ArrowRight class="w-3 h-3 ml-2" />
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <!-- Right Column: Tools & Progress -->
      <div class="space-y-8">
        <!-- Matching Engine -->
        <Card title="Auto-Match Engine">
          <div class="space-y-6">
            <div class="relative flex items-center justify-center py-8">
               <div class="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative overflow-hidden">
                 <div class="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                 <div class="text-center">
                   <div class="text-3xl font-bold text-white">94%</div>
                   <div class="text-[8px] text-slate-500 uppercase font-bold tracking-widest mt-1">Integrity</div>
                 </div>
               </div>
               <!-- Radar pulses -->
               <div class="absolute inset-0 flex items-center justify-center">
                 <div class="w-48 h-48 rounded-full border border-indigo-500/10 animate-ping"></div>
               </div>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Perfect Matches</span>
                <span class="text-emerald-400 font-bold">1,402</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Algorithmic Suggestion</span>
                <span class="text-amber-400 font-bold">12</span>
              </div>
              <BaseButton variant="primary" class="w-full" @click="handleReconSweep" :loading="isReconSweeping">
                <Zap :class="['w-4 h-4 mr-2', { 'animate-pulse text-yellow-400': isReconSweeping }]" />
                {{ isReconSweeping ? 'Sweeping...' : 'Run Recon Sweep' }}
              </BaseButton>
            </div>
          </div>
        </Card>

        <!-- Integrity Checklist -->
        <Card title="Settlement Integrity">
          <div class="space-y-4">
            <div v-for="check in ['Ledger Balance Matches', 'Bank Deposits Verified', 'NIP Payouts Balanced', 'Stablecoin Liquidity Synced']" :key="check" class="flex items-center gap-3">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-xs text-slate-300 font-medium">{{ check }}</span>
            </div>
          </div>
        </Card>
      </div>

    </div>

    <!-- Footer Security Banner -->
    <div class="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-white">Cryptographic Settlement Proof</h4>
          <p class="text-xs text-slate-500">All reconciliation results are hashed and anchored to the BlocPoint immutable ledger.</p>
        </div>
      </div>
      <BaseButton variant="secondary" size="sm" @click="handleDownloadAudit" :loading="isDownloading">Download Audit Trial</BaseButton>
    </div>

    <!-- Modals & Drawers -->

    <!-- Investigation Drawer -->
    <BaseDrawer 
      :show="showInvestigateDrawer" 
      :title="`Discrepancy Investigation: ${selectedEx?.id}`" 
      description="Comparative Analysis vs External Data Nodes"
      width="lg"
      @close="showInvestigateDrawer = false"
    >
      <div v-if="selectedEx" class="space-y-8">
        <!-- Delta Analysis Card -->
        <div class="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
           <div class="flex justify-between items-center">
             <div class="flex items-center gap-3">
               <div class="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                 <AlertTriangle class="w-5 h-5" />
               </div>
               <h4 class="text-sm font-bold text-white uppercase tracking-wider">Audit Delta Found</h4>
             </div>
             <StatusBadge :status="selectedEx.status" size="md" />
           </div>
           
           <p class="text-xs text-slate-400 leading-relaxed">{{ selectedEx.details }}</p>
           
           <div class="grid grid-cols-2 gap-4 mt-6">
             <div class="p-3 bg-white/5 rounded-xl border border-white/10">
               <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Internal Ledger</div>
               <div class="text-lg font-bold text-white font-mono">{{ formatCurrency(selectedEx.internal) }}</div>
             </div>
             <div class="p-3 bg-white/5 rounded-xl border border-white/10">
               <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">External Data</div>
               <div class="text-lg font-bold text-rose-400 font-mono">{{ formatCurrency(selectedEx.external) }}</div>
             </div>
           </div>
        </div>

        <!-- Investigation Tools -->
        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Automated Resolution Paths</h4>
           <div class="grid grid-cols-1 gap-3">
             <button class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all text-left group">
                <div class="flex items-center gap-3">
                  <TrendingUp class="w-5 h-5 text-indigo-400" />
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-wider">Sync with Statement</div>
                    <div class="text-[10px] text-slate-500 mt-0.5 italic">Adjust ledger to match bank records</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
             </button>
             <button class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all text-left group">
                <div class="flex items-center gap-3">
                  <ShieldAlert class="w-5 h-5 text-emerald-400" />
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-wider">Mark as Valid Exception</div>
                    <div class="text-[10px] text-slate-500 mt-0.5 italic">Acknowledge discrepancy as expected behavior</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
             </button>
           </div>
        </div>

        <!-- System Context -->
        <div class="space-y-3">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Metadata</h4>
           <Card padding="p-4" class="bg-dark-bg/50 border-white/5">
              <div class="space-y-3 font-mono text-[9px]">
                 <div class="flex justify-between items-center">
                    <span class="text-slate-600 uppercase font-bold">Source Node</span>
                    <span class="text-indigo-400">{{ selectedEx.source }} gateway</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-slate-600 uppercase font-bold">Last Activity</span>
                    <span class="text-white">today, 08:12 AM</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-slate-600 uppercase font-bold">Engine Verifier</span>
                    <span class="text-white flex items-center gap-1">
                      <Cpu class="w-3 h-3 text-cyan-400" />
                      RECON-AI-v4.2
                    </span>
                 </div>
              </div>
           </Card>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full">
             <FileText class="w-4 h-4 mr-2" /> View Logs
           </BaseButton>
           <BaseButton variant="secondary" size="md" class="w-full text-rose-400 border-rose-500/10 hover:bg-rose-500/5">
             <ShieldAlert class="w-4 h-4 mr-2" /> Escalate Discrepancy
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" size="md" class="w-full" @click="showInvestigateDrawer = false">Acknowledge Audit</BaseButton>
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
