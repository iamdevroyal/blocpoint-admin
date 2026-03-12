<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  CheckCircle2, 
  CheckCheck, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Trash2, 
  ChevronRight, 
  Bell 
} from 'lucide-vue-next'
import Card from '../../components/misc/Card.vue'
import BaseButton from '../../components/forms/BaseButton.vue'

import { useNotificationStore } from '../../stores/notifications'
import { useRouter } from 'vue-router'

const router = useRouter()
const notificationStore = useNotificationStore()

const search = ref('')
const filterType = ref('all')

const filteredNotifications = computed(() => {
  return notificationStore.notifications.filter(n => {
    const q = search.value.toLowerCase()
    const matchesSearch = n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    const matchesFilter = filterType.value === 'all' || n.type === filterType.value
    return matchesSearch && matchesFilter
  })
})

function markAllRead() {
  notificationStore.markAllRead()
}

function openDetail(n: any) {
  router.push(`/notifications/${n.id}`)
}

function deleteNotification(id: number) {
  notificationStore.deleteNotification(id)
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

    <!-- Detail Drawer removed in favor of dedicated detail page -->
  </div>
</template>
