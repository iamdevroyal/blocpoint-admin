<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  TrendingUp,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  Filter,
} from 'lucide-vue-next'
import Card from '../../components/misc/Card.vue'
import BaseButton from '../../components/forms/BaseButton.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'
import apiClient from '../../api/axios'

// ─── State ─────────────────────────────────────────────────────────────
const loading = ref(false)
const eventsLoading = ref(false)
const error = ref<string | null>(null)

const totals = ref({
  vat_total: 0,
  emtl_total: 0,
  digital_gain_total: 0,
  event_count: 0,
})

const taxEvents = ref<any[]>([])
const taxEventsMeta = ref<any>(null)

const search = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dateFrom = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const dateTo = ref(new Date().toISOString().split('T')[0])

const selectedEvent = ref<any>(null)
const showEventDrawer = ref(false)
const isExporting = ref(false)

const notification = ref({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' })

// ─── Formatters ────────────────────────────────────────────────────────
const formatNGN = (amount: number | string) =>
  Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })

const taxTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    vat: 'VAT (7.5%)',
    emtl: 'EMTL (₦50)',
    digital_gain: 'Digital Asset Gain',
  }
  return labels[type] || type.toUpperCase()
}

const taxTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    vat: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    emtl: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    digital_gain: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  }
  return colors[type] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

// ─── Computed ──────────────────────────────────────────────────────────
const totalCollected = computed(() =>
  totals.value.vat_total + totals.value.emtl_total + totals.value.digital_gain_total
)

const statsCards = computed(() => [
  {
    label: 'Total VAT Collected',
    value: '₦ ' + formatNGN(totals.value.vat_total),
    color: 'text-indigo-400',
    icon: DollarSign,
    bg: 'bg-indigo-400/10',
  },
  {
    label: 'Total EMTL Collected',
    value: '₦ ' + formatNGN(totals.value.emtl_total),
    color: 'text-amber-400',
    icon: AlertCircle,
    bg: 'bg-amber-400/10',
  },
  {
    label: 'Digital Gain Events',
    value: '₦ ' + formatNGN(totals.value.digital_gain_total),
    color: 'text-purple-400',
    icon: TrendingUp,
    bg: 'bg-purple-400/10',
  },
  {
    label: 'Total Tax Collected',
    value: '₦ ' + formatNGN(totalCollected.value),
    color: 'text-emerald-400',
    icon: CheckCircle2,
    bg: 'bg-emerald-400/10',
  },
])

// ─── API Calls ─────────────────────────────────────────────────────────
async function loadTotals() {
  loading.value = true
  error.value = null
  try {
    const { data } = await apiClient.get('/admin/compliance/tax-events/totals', {
      params: { date_from: dateFrom.value, date_to: dateTo.value },
    })
    totals.value = data.data ?? data
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Failed to load tax totals.'
  } finally {
    loading.value = false
  }
}

async function loadEvents(page = 1) {
  eventsLoading.value = true
  try {
    const { data } = await apiClient.get('/admin/compliance/tax-events', {
      params: {
        tax_type: filterType.value || undefined,
        status: filterStatus.value || undefined,
        date_from: dateFrom.value,
        date_to: dateTo.value,
        page,
        per_page: 25,
      },
    })
    taxEvents.value = data.data ?? data
    taxEventsMeta.value = data.meta ?? null
  } catch (err: any) {
    showNotification('Failed to load tax events.', 'error')
  } finally {
    eventsLoading.value = false
  }
}

function applyFilters() {
  loadTotals()
  loadEvents(1)
}

function openEventDrawer(event: any) {
  selectedEvent.value = event
  showEventDrawer.value = true
}

async function handleExport() {
  isExporting.value = true
  try {
    const { data } = await apiClient.get('/admin/compliance/tax-events/export', {
      params: { date_from: dateFrom.value, date_to: dateTo.value, format: 'csv' },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `tax-events-${dateFrom.value}-to-${dateTo.value}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showNotification('Export complete.', 'success')
  } catch {
    showNotification('Export failed.', 'error')
  } finally {
    isExporting.value = false
  }
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3500)
}

onMounted(() => {
  loadTotals()
  loadEvents()
})
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Tax Intelligence</h1>
        <p class="text-slate-400 mt-1">VAT, EMTL, and digital asset gain tracking across all agents.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="applyFilters" :loading="loading">
          <RefreshCw class="w-4 h-4 mr-2" /> Refresh
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleExport" :loading="isExporting">
          <Download class="w-4 h-4 mr-2" /> Export CSV
        </BaseButton>
      </div>
    </div>

    <!-- Date Range & Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-slate-500" />
        <span class="text-xs font-bold text-slate-400 uppercase">Period:</span>
      </div>
      <input
        v-model="dateFrom"
        type="date"
        class="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
      <span class="text-slate-500 text-xs">→</span>
      <input
        v-model="dateTo"
        type="date"
        class="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
      <select
        v-model="filterType"
        class="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <option value="">All Types</option>
        <option value="vat">VAT</option>
        <option value="emtl">EMTL</option>
        <option value="digital_gain">Digital Gain</option>
      </select>
      <select
        v-model="filterStatus"
        class="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <option value="">All Statuses</option>
        <option value="assessed">Assessed</option>
        <option value="reserved">Reserved</option>
        <option value="remitted">Remitted</option>
        <option value="voided">Voided</option>
      </select>
      <BaseButton variant="primary" size="sm" @click="applyFilters">Apply</BaseButton>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in statsCards" :key="stat.label" class="relative overflow-hidden">
        <div class="flex items-center gap-4">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center', stat.bg]">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p :class="['text-lg font-bold', stat.color]">{{ stat.value }}</p>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </Card>
    </div>

    <!-- Tax Events Table -->
    <Card title="Tax Events Ledger">
      <div class="space-y-4">

        <!-- Event count -->
        <div class="text-xs text-slate-500">
          Showing {{ taxEvents.length }} event(s) for selected period.
          Total assessed: <span class="text-white font-bold">{{ totals.event_count }}</span>
        </div>

        <!-- Loading -->
        <div v-if="eventsLoading" class="space-y-3">
          <div v-for="n in 5" :key="n" class="h-16 rounded-2xl bg-white/5 animate-pulse" />
        </div>

        <!-- Empty -->
        <div v-else-if="!taxEvents.length" class="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
          No tax events found for the selected period.
        </div>

        <!-- Rows -->
        <div v-else class="space-y-2">
          <div
            v-for="event in taxEvents"
            :key="event.id"
            class="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all cursor-pointer"
            @click="openEventDrawer(event)"
          >
            <div class="flex items-center gap-4">
              <span :class="['px-2 py-1 rounded-lg text-[10px] font-bold border uppercase', taxTypeColor(event.tax_type)]">
                {{ event.tax_type?.toUpperCase() }}
              </span>
              <div>
                <p class="text-xs font-bold text-white">₦ {{ formatNGN(event.tax_amount) }}</p>
                <p class="text-[10px] text-slate-500">
                  Agent: {{ event.agent?.business_name || event.agent_id?.slice(0, 8) + '...' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="hidden sm:block text-right">
                <p class="text-[10px] text-slate-500">Base Amount</p>
                <p class="text-xs font-bold text-white">₦ {{ formatNGN(event.tax_base) }}</p>
              </div>
              <StatusBadge :status="event.status" class="scale-90 origin-right" />
              <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="taxEventsMeta?.last_page > 1" class="flex items-center justify-center gap-2 pt-4">
          <BaseButton
            v-for="page in taxEventsMeta.last_page"
            :key="page"
            variant="ghost"
            size="sm"
            :class="page === taxEventsMeta.current_page ? 'text-indigo-400' : 'text-slate-500'"
            @click="loadEvents(page)"
          >
            {{ page }}
          </BaseButton>
        </div>
      </div>
    </Card>

    <!-- Event Detail Drawer -->
    <BaseDrawer
      :show="showEventDrawer"
      :title="'Tax Event: ' + (selectedEvent?.tax_type?.toUpperCase() || '')"
      description="Full details about this tax assessment"
      @close="showEventDrawer = false"
    >
      <div v-if="selectedEvent" class="space-y-6">
        <div class="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-400">Tax Type</span>
            <span :class="['px-3 py-1 rounded-lg text-xs font-bold border uppercase', taxTypeColor(selectedEvent.tax_type)]">
              {{ taxTypeLabel(selectedEvent.tax_type) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-400">Status</span>
            <StatusBadge :status="selectedEvent.status" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Tax Base</p>
            <p class="text-sm font-bold text-white">₦ {{ formatNGN(selectedEvent.tax_base) }}</p>
          </div>
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Tax Amount</p>
            <p class="text-sm font-bold text-indigo-400">₦ {{ formatNGN(selectedEvent.tax_amount) }}</p>
          </div>
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Tax Rate</p>
            <p class="text-sm font-bold text-white">{{ selectedEvent.tax_rate ? (Number(selectedEvent.tax_rate) * 100).toFixed(1) + '%' : 'Flat Fee' }}</p>
          </div>
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p class="text-[9px] text-slate-500 font-bold uppercase mb-1">Agent</p>
            <p class="text-xs font-mono text-white truncate">{{ selectedEvent.agent_id }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-[9px] text-slate-500 font-bold uppercase">Transaction ID</p>
          <p class="text-xs font-mono text-slate-300 break-all">{{ selectedEvent.transaction_id || '—' }}</p>
        </div>
        <div class="space-y-2">
          <p class="text-[9px] text-slate-500 font-bold uppercase">Event ID</p>
          <p class="text-xs font-mono text-slate-300 break-all">{{ selectedEvent.id }}</p>
        </div>
        <div class="space-y-2">
          <p class="text-[9px] text-slate-500 font-bold uppercase">Assessed At</p>
          <p class="text-xs text-slate-300">{{ new Date(selectedEvent.created_at).toLocaleString() }}</p>
        </div>
      </div>
    </BaseDrawer>

    <!-- Notification Toast -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="notification.show" class="fixed bottom-8 right-8 z-[100] max-w-sm w-full bg-[#1a1f2e] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
          notification.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
        ]">
          <component :is="notification.type === 'success' ? CheckCircle2 : AlertCircle" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>

  </div>
</template>
