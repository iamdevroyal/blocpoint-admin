<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ShieldAlert, 
  Bell, 
  ArrowLeft,
  Calendar,
  Clock,
  Database,
  Trash2,
  ExternalLink,
  RotateCcw
} from 'lucide-vue-next'
import { useNotificationStore } from '../../stores/notifications'
import Card from '../../components/misc/Card.vue'
import BaseButton from '../../components/forms/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const notificationId = computed(() => Number(route.params.id))
const notification = computed(() => notificationStore.getNotificationById(notificationId.value))

onMounted(() => {
  if (notification.value) {
    notificationStore.markAsRead(notification.value.id)
  }
})

function handleDelete() {
  if (notification.value) {
    notificationStore.deleteNotification(notification.value.id)
    router.push('/notifications')
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <BaseButton variant="ghost" size="sm" @click="goBack" class="text-slate-400 hover:text-white">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Engine
      </BaseButton>
      <div class="flex gap-2">
        <BaseButton variant="ghost" size="sm" class="text-rose-500" @click="handleDelete">
          <Trash2 class="w-4 h-4 mr-2" />
          Purge Record
        </BaseButton>
      </div>
    </div>

    <div v-if="notification">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Info -->
        <div class="lg:col-span-2 space-y-6">
          <Card padding="p-8" class="relative overflow-hidden border-indigo-500/20 bg-indigo-500/5">
            <div class="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert v-if="notification.type === 'critical'" class="w-32 h-32" />
              <Bell v-else class="w-32 h-32" />
            </div>

            <div class="relative">
              <div :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border',
                notification.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                notification.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
              ]">
                <span class="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
                {{ notification.type }} Alert
              </div>

              <h1 class="text-3xl font-bold text-white mb-4 leading-tight">{{ notification.title }}</h1>
              <p class="text-lg text-slate-300 leading-relaxed">{{ notification.message }}</p>
            </div>
          </Card>

          <Card v-if="notification.metadata" padding="p-6">
            <div class="flex items-center gap-2 mb-6">
              <Database class="w-4 h-4 text-indigo-400" />
              <h3 class="text-xs font-bold text-white uppercase tracking-widest">Contextual Metadata</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(val, key) in notification.metadata" 
                :key="key"
                class="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1"
              >
                <span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{{ (key as string).replace('_', ' ') }}</span>
                <span class="font-mono text-sm text-white break-all">{{ val }}</span>
              </div>
            </div>
          </Card>
        </div>

        <!-- Right Column: Metadata & Actions -->
        <div class="space-y-6">
          <Card padding="p-6" class="space-y-6">
            <div>
              <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Event Timeline</h4>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Calendar class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase font-bold">Registration Date</p>
                    <p class="text-xs text-white">{{ notification.date }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Clock class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-500 uppercase font-bold">Relative Delta</p>
                    <p class="text-xs text-white">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-white/5">
              <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Origin & Authority</h4>
              <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                <p class="text-xs font-bold text-white">{{ notification.source }}</p>
                <p class="text-[10px] text-slate-500 mt-1 uppercase">Subsystem Primary</p>
              </div>
            </div>

            <div class="pt-6 border-t border-white/5 space-y-3">
              <BaseButton variant="primary" class="w-full">
                Audit Trail <ExternalLink class="w-4 h-4 ml-2" />
              </BaseButton>
              <BaseButton variant="secondary" class="w-full">
                Replay Event <RotateCcw class="w-4 h-4 ml-2" />
              </BaseButton>
            </div>
          </Card>

          <div class="p-6 rounded-3xl border border-white/5 bg-white/[0.02] text-center">
             <p class="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
               Security ID: {{ notification.id }} <br>
               Encryption: AES-256-GCM
             </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
        <ShieldAlert class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Record Not Found</h2>
      <p class="text-slate-500 mb-6">The requested notification record has been purged or does not exist.</p>
      <BaseButton variant="primary" @click="router.push('/notifications')">
        Return to Engine
      </BaseButton>
    </div>
  </div>
</template>
