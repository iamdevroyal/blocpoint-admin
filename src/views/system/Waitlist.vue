<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Users,
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Clock,
  Filter,
  X,
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import { useWaitlistStore } from '../../stores/waitlist'

const store = useWaitlistStore()

// ─── Notification toast ────────────────────────────────────────────
const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'info',
})

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// ─── Delete Confirmation ────────────────────────────────────────────
const confirmDeleteId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

async function confirmDelete(id: string) {
  confirmDeleteId.value = id
}

async function executeDelete() {
  if (!confirmDeleteId.value) return
  const id = confirmDeleteId.value
  deletingId.value = id
  confirmDeleteId.value = null
  try {
    await store.deleteEntry(id)
    showNotification('Waitlist entry removed.', 'success')
  } catch {
    showNotification('Failed to delete entry.', 'error')
  } finally {
    deletingId.value = null
  }
}

// ─── Status Update ─────────────────────────────────────────────────
const updatingId = ref<string | null>(null)

async function handleStatusChange(id: string, status: string) {
  updatingId.value = id
  try {
    await store.updateStatus(id, status)
    showNotification('Status updated successfully.', 'success')
  } catch {
    showNotification('Failed to update status.', 'error')
  } finally {
    updatingId.value = null
  }
}

// ─── Debounced search ──────────────────────────────────────────────
let searchTimeout: ReturnType<typeof setTimeout>
watch(() => store.filters.search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchWaitlist(1), 400)
})

// ─── Filter changes trigger immediate reload ───────────────────────
watch(
  () => [store.filters.status, store.filters.platform, store.filters.role],
  () => store.fetchWaitlist(1)
)

// ─── Export ────────────────────────────────────────────────────────
function handleExport() {
  store.exportCsv()
  showNotification('Waitlist exported as CSV.', 'success')
}

// ─── Helpers ───────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:   'text-amber-400 bg-amber-400/10 border-amber-500/20',
  contacted: 'text-sky-400 bg-sky-400/10 border-sky-500/20',
  invited:   'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  rejected:  'text-rose-400 bg-rose-400/10 border-rose-500/20',
}

function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? 'text-slate-400 bg-white/5 border-white/10'
}

function platformIcon(platform: string) {
  if (platform === 'ios' || platform === 'android') return Smartphone
  return Globe
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Boot ──────────────────────────────────────────────────────────
onMounted(() => store.fetchWaitlist(1))
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Users class="w-8 h-8 text-indigo-500" />
          Waitlist
        </h1>
        <p class="text-slate-400 mt-1">Manage users who have signed up for early access.</p>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary" size="sm" @click="store.fetchWaitlist(store.pagination.currentPage)" :loading="store.loading">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleExport">
          <Download class="w-4 h-4 mr-2" />
          Export CSV
        </BaseButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card v-for="stat in [
        { label: 'Total Signups', value: store.pagination.total, color: 'text-indigo-400', icon: Users },
        { label: 'Pending', value: store.entries.filter(e => e.status === 'pending').length, color: 'text-amber-400', icon: Clock },
        { label: 'Invited', value: store.entries.filter(e => e.status === 'invited').length, color: 'text-emerald-400', icon: CheckCircle2 },
        { label: 'Rejected', value: store.entries.filter(e => e.status === 'rejected').length, color: 'text-rose-400', icon: AlertTriangle },
      ]" :key="stat.label" padding="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 flex-wrap">
      <!-- Search -->
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search by email or name..."
          class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button v-if="store.filters.search" @click="store.filters.search = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Status filter -->
      <div class="relative">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <select
          v-model="store.filters.status"
          class="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="invited">Invited</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Platform filter -->
      <select
        v-model="store.filters.platform"
        class="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[140px]"
      >
        <option value="">All Platforms</option>
        <option value="web">Web</option>
        <option value="ios">iOS</option>
        <option value="android">Android</option>
      </select>

      <!-- Role filter -->
      <select
        v-model="store.filters.role"
        class="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[140px]"
      >
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="agent">Agent</option>
      </select>

      <!-- Reset -->
      <BaseButton variant="ghost" size="sm" @click="store.resetFilters()" class="text-slate-500 hover:text-white">
        <X class="w-4 h-4 mr-1.5" />
        Reset
      </BaseButton>
    </div>

    <!-- Table -->
    <Card padding="p-0" class="overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="store.loading" class="p-8 space-y-4">
        <div v-for="i in 5" :key="i" class="h-14 bg-white/5 rounded-xl animate-pulse" />
      </div>

      <!-- Error state -->
      <div v-else-if="store.error" class="p-12 text-center">
        <AlertTriangle class="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p class="text-rose-400 font-semibold">{{ store.error }}</p>
        <BaseButton variant="secondary" size="sm" class="mt-4" @click="store.fetchWaitlist(1)">
          Retry
        </BaseButton>
      </div>

      <!-- Empty state -->
      <div v-else-if="store.entries.length === 0" class="p-12 text-center">
        <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users class="w-7 h-7 text-indigo-400" />
        </div>
        <h3 class="text-white font-bold">No waitlist entries</h3>
        <p class="text-xs text-slate-500 mt-1">Signups from the landing page will appear here.</p>
      </div>

      <!-- Data table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/5">
              <th class="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Contact</th>
              <th class="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4 hidden md:table-cell">Platform</th>
              <th class="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4 hidden md:table-cell">Role</th>
              <th class="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Status</th>
              <th class="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4 hidden lg:table-cell">Joined</th>
              <th class="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="entry in store.entries"
              :key="entry.id"
              class="group hover:bg-white/[0.02] transition-colors"
            >
              <!-- Contact -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ entry.full_name || '—' }}</p>
                    <p class="text-xs text-slate-500">{{ entry.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Platform -->
              <td class="px-6 py-4 hidden md:table-cell">
                <div class="flex items-center gap-2 text-slate-400 text-xs">
                  <component :is="platformIcon(entry.platform)" class="w-3.5 h-3.5" />
                  {{ entry.platform }}
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="text-xs text-slate-400 capitalize">{{ entry.role }}</span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <div class="relative">
                  <select
                    :value="entry.status"
                    @change="handleStatusChange(entry.id, ($event.target as HTMLSelectElement).value)"
                    :disabled="updatingId === entry.id"
                    :class="[
                      'text-[10px] font-bold uppercase tracking-widest border rounded-lg py-1 pl-2 pr-6 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50',
                      statusStyle(entry.status),
                      updatingId === entry.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                    ]"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="invited">Invited</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </td>

              <!-- Joined -->
              <td class="px-6 py-4 hidden lg:table-cell">
                <span class="text-xs text-slate-500 font-mono">{{ formatDate(entry.created_at) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <button
                  @click="confirmDelete(entry.id)"
                  :disabled="deletingId === entry.id"
                  class="w-8 h-8 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100"
                  title="Delete entry"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="!store.loading && store.entries.length > 0"
        class="flex items-center justify-between px-6 py-4 border-t border-white/5"
      >
        <span class="text-xs text-slate-500">
          Showing {{ ((store.pagination.currentPage - 1) * store.pagination.perPage) + 1 }}–{{ Math.min(store.pagination.currentPage * store.pagination.perPage, store.pagination.total) }}
          of {{ store.pagination.total }} entries
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="store.fetchWaitlist(store.pagination.currentPage - 1)"
            :disabled="store.pagination.currentPage === 1 || store.loading"
            class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-xs text-slate-400 px-2">
            {{ store.pagination.currentPage }} / {{ store.pagination.lastPage }}
          </span>
          <button
            @click="store.fetchWaitlist(store.pagination.currentPage + 1)"
            :disabled="store.pagination.currentPage === store.pagination.lastPage || store.loading"
            class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>

    <!-- Delete Confirmation Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="confirmDeleteId" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmDeleteId = null" />
        <div class="relative bg-[#1a1f2e] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
          <div class="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
            <Trash2 class="w-7 h-7 text-rose-400" />
          </div>
          <h3 class="text-xl font-bold text-white text-center">Delete Entry?</h3>
          <p class="text-sm text-slate-400 text-center mt-2">
            This waitlist entry will be permanently removed. This action cannot be undone.
          </p>
          <div class="flex gap-3 mt-8">
            <BaseButton variant="secondary" class="flex-1" @click="confirmDeleteId = null">Cancel</BaseButton>
            <BaseButton variant="danger" class="flex-1" @click="executeDelete">Delete</BaseButton>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="notification.show" class="fixed bottom-8 right-8 z-[100] max-w-sm w-full bg-[#1a1f2e] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
          notification.type === 'error'   ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
        ]">
          <component :is="notification.type === 'success' ? CheckCircle2 : notification.type === 'error' ? AlertTriangle : Activity" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>

  </div>
</template>

<style scoped>
select option {
  background-color: #1a1f2e;
  color: #fff;
}
</style>
