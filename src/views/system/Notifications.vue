<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Globe, 
  History,
  Camera,
  Save,
  CheckCircle2,
  Fingerprint
} from 'lucide-vue-next'
import Card from '../../components/misc/Card.vue'
import BaseButton from '../../components/forms/BaseButton.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const filterType = ref('all')
const selectedNotification = ref<any>(null)
const showDetail = ref(false)

const notifications = ref([
  { 
    id: 1, 
    type: 'critical', 
    title: 'AML Alert: High Volume Transfer', 
    message: 'Wallet UUID 550e...-440000 detected a transfer of ₦15,000,000.00 exceeding risk threshold.',
    time: '2 mins ago', 
    date: '2024-02-22 10:45',
    read: false,
    source: 'Risk Engine',
    metadata: {
      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 15000000,
      rule_triggered: 'HIGH_VOLUME_P2P'
    }
  },
  { 
    id: 2, 
    type: 'info', 
    title: 'New Agent Tier 3 Registration', 
    message: 'Sarah Ahmed has applied for Tier 3 agent status. Documentation is ready for review.',
    time: '15 mins ago', 
    date: '2024-02-22 10:32',
    read: false,
    source: 'Onboarding'
  },
  { 
    id: 3, 
    type: 'success', 
    title: 'Inter-vault Settlement Completed', 
    message: 'Weekly settlement between Operational Vault and Settlement Reserve was successful.',
    time: '1h ago', 
    date: '2024-02-22 09:15',
    read: true,
    source: 'Treasury'
  },
  { 
    id: 4, 
    type: 'warning', 
    title: 'Low Liquidity Notice: NGN/USDT', 
    message: 'Stablecoin liquidity provider pool (YellowCard) is approaching its lower bound margin.',
    time: '3h ago', 
    date: '2024-02-22 07:45',
    read: true,
    source: 'Liquidity'
  },
  { 
    id: 5, 
    type: 'info', 
    title: 'System Patch Deployed: v2.4.1', 
    message: 'Global pricing engine routes updated. Latency optimized across all network nodes.',
    time: '5h ago', 
    date: '2024-02-22 05:12',
    read: true,
    source: 'Core DevOps'
  }
])

const filteredNotifications = computed(() => {
  return notifications.value.filter(n => {
    const q = search.value.toLowerCase()
    const matchesSearch = n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    const matchesFilter = filterType.value === 'all' || n.type === filterType.value
    return matchesSearch && matchesFilter
  })
})

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function openDetail(n: any) {
  selectedNotification.value = n
  n.read = true
  showDetail.value = true
}

function deleteNotification(id: number) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Notification Engine</h2>
        <p class="text-slate-400">Manage real-time system alerts, compliance warnings, and operational events.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="markAllRead">
          <CheckCheck class="w-4 h-4 mr-2" />
          Mark all as read
        </BaseButton>
      </div>
    </div>

    <!-- Filters & Search -->
    <Card padding="p-4" class="bg-indigo-500/5 border-indigo-500/10">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            v-model="search"
            type="text" 
            placeholder="Search notifications, metadata, alerts..." 
            class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <button 
            v-for="type in ['all', 'critical', 'warning', 'info', 'success']" 
            :key="type"
            @click="filterType = type"
            :class="[
              'px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border',
              filterType === type ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </Card>

    <!-- Notification List -->
    <div class="grid grid-cols-1 gap-4">
      <div 
        v-for="n in filteredNotifications" 
        :key="n.id"
        @click="openDetail(n)"
        :class="[
          'glass-panel p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden',
          n.read ? 'border-white/5 bg-white/[0.02] opacity-80' : 'border-indigo-500/20 bg-indigo-500/5'
        ]"
      >
        <div v-if="!n.read" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
        
        <div class="flex items-start gap-4">
          <div :class="[
            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border',
            n.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-lg shadow-rose-500/10' :
            n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
            n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
            'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
          ]">
            <ShieldAlert v-if="n.type === 'critical'" class="w-6 h-6" />
            <AlertTriangle v-else-if="n.type === 'warning'" class="w-6 h-6" />
            <CheckCircle2 v-else-if="n.type === 'success'" class="w-6 h-6" />
            <Info v-else class="w-6 h-6" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{{ n.title }}</h3>
              <span class="text-[10px] text-slate-500 font-mono">{{ n.time }}</span>
            </div>
            <p class="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{{ n.message }}</p>
            
            <div class="flex flex-wrap gap-2 items-center">
              <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{{ n.source }}</span>
              <span v-if="n.read" class="text-[9px] text-slate-600 uppercase flex items-center"><CheckCheck class="w-3 h-3 mr-1" /> Archived</span>
            </div>
          </div>

          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <BaseButton variant="ghost" size="sm" class="text-rose-500" @click.stop="deleteNotification(n.id)">
              <Trash2 class="w-4 h-4" />
            </BaseButton>
            <ChevronRight class="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      <div v-if="filteredNotifications.length === 0" class="p-20 text-center">
        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
          <Bell class="w-8 h-8" />
        </div>
        <p class="text-slate-500">No notifications found matching your criteria.</p>
      </div>
    </div>

    <!-- Detail Drawer -->
    <BaseDrawer 
      :show="showDetail" 
      :title="selectedNotification?.title" 
      description="Detailed technical summary and contextual metadata for the selected event."
      @close="showDetail = false"
    >
      <div v-if="selectedNotification" class="space-y-8">
        <div class="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
          <div class="flex items-center gap-4 mb-4">
             <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center border',
                selectedNotification.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
             ]">
                <ShieldAlert v-if="selectedNotification.type === 'critical'" class="w-5 h-5" />
                <Bell v-else class="w-5 h-5" />
             </div>
             <div>
                <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Event Source</p>
                <p class="text-sm font-bold text-white">{{ selectedNotification.source }}</p>
             </div>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed">{{ selectedNotification.message }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <Card padding="p-4" class="text-center">
              <p class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Incident Time</p>
              <p class="text-xs font-mono text-white">{{ selectedNotification.date }}</p>
           </Card>
           <Card padding="p-4" class="text-center">
              <p class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Status</p>
              <p class="text-xs font-bold text-white uppercase">{{ selectedNotification.read ? 'Archived' : 'Active' }}</p>
           </Card>
        </div>

        <div v-if="selectedNotification.metadata" class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contextual Metadata</h4>
           <div class="space-y-3">
              <div v-for="(val, key) in selectedNotification.metadata" :key="key" class="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-center">
                 <span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{{ (key as string).replace('_', ' ') }}</span>
                 <span class="font-mono text-xs text-white">{{ val }}</span>
              </div>
           </div>
        </div>

        <div class="pt-8 border-t border-white/10 space-y-4">
           <BaseButton variant="primary" class="w-full py-4 text-sm">
             Investigate Deep Link <ArrowRight class="w-4 h-4 ml-2" />
           </BaseButton>
           <BaseButton variant="ghost" class="w-full text-rose-500" @click="deleteNotification(selectedNotification.id); showDetail = false">
             Delete Permanent Record
           </BaseButton>
        </div>
      </div>
    </BaseDrawer>
  </div>
</template>
