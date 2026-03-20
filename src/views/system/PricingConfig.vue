<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Settings2,
  Coins,
  Save,
  RefreshCcw,
  Search,
  Plus,
  TrendingUp,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Zap,
  Tag,
} from 'lucide-vue-next'

import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import BaseModal from '../../components/modals/BaseModal.vue'

import { usePricingStore, type SystemConfig } from '../../stores/pricing'

const pricingStore = usePricingStore()

// ─── State ──────────────────────────────────────────────────────────────────
const activeTab = ref('fees')
const search   = ref('')

const showEditModal   = ref(false)
const showCreateModal = ref(false)
const editingConfig   = ref<SystemConfig | null>(null)
const editValue       = ref('')

const newKey         = ref('')
const newValue       = ref('')
const newType        = ref('float')
const newDescription = ref('')
const createTarget   = ref('fee') // default prefix for new custom key

const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'info',
})

// ─── Tab definitions ────────────────────────────────────────────────────────
const tabs = [
  { id: 'fees',        label: 'Transaction Fees',    icon: Tag },
  { id: 'rates',       label: 'Interest Rates',      icon: TrendingUp },
  { id: 'commissions', label: 'Agent Commissions',   icon: Coins },
  { id: 'tax',         label: 'Tax & Compliance',    icon: ShieldCheck },
  { id: 'limits',      label: 'Product Limits',      icon: Lock },
]

// ─── Computed: filtered configs for each tab ─────────────────────────────────
const feeConfigs = computed(() =>
  pricingStore.feeConfigs.filter(c =>
    !search.value || c.key.includes(search.value.toLowerCase()) || (c.description ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)
const rateConfigs = computed(() => pricingStore.rateConfigs)
const commissionConfigs = computed(() => pricingStore.commissionConfigs)
const taxConfigs = computed(() => pricingStore.taxConfigs)
const limitConfigs = computed(() => [
  ...pricingStore.lendingConfigs,
  ...pricingStore.stablecoinConfigs,
  ...pricingStore.virtualCardConfigs,
])

// ─── Notification helper ──────────────────────────────────────────────────────
function notify(message: string, type: 'success' | 'error' | 'info' = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 4000)
}

// ─── Format display value ─────────────────────────────────────────────────────
function formatValue(config: SystemConfig): string {
  if (config.is_encrypted) return '••••••••'
  const v = config.value
  if (config.type === 'float') {
    const n = parseFloat(v)
    // If it looks like a rate (< 2) format as percentage, otherwise as plain number
    if (n > 0 && n < 2 && config.key.includes('rate') || config.key.includes('fee.') && n < 1) {
      return `${(n * 100).toFixed(2)}%`
    }
    return `${Number(v).toLocaleString()}`
  }
  return String(v)
}

function getLabelFromKey(key: string): string {
  // Convert dot.notation.key → Title Case Label
  const parts = key.split('.')
  const last = (parts[parts.length - 1] ?? '').replace(/_/g, ' ')
  return last.replace(/\b\w/g, c => c.toUpperCase())
}

function getGroupFromKey(key: string): string {
  const first = key.split('.')[0]
  return first ? first.toUpperCase() : ''
}

function getTypeClass(type: string): string {
  const map: Record<string, string> = {
    float: 'badge-blue',
    integer: 'badge-purple',
    boolean: 'badge-green',
    json: 'badge-orange',
    string: 'badge-gray',
  }
  return map[type] ?? 'badge-gray'
}

// ─── Edit actions ─────────────────────────────────────────────────────────────
function openEdit(config: SystemConfig) {
  editingConfig.value = config
  editValue.value = String(config.value)
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingConfig.value) return
  const ok = await pricingStore.updateConfig(editingConfig.value.key, editValue.value)
  if (ok) {
    notify(`✓ ${editingConfig.value.key} updated successfully`)
    showEditModal.value = false
    editingConfig.value = null
  } else {
    notify(pricingStore.error ?? 'Update failed.', 'error')
  }
}

// ─── Create actions ───────────────────────────────────────────────────────────
function openCreate() {
  newKey.value = createTarget.value + '.'
  newValue.value = ''
  newType.value = 'float'
  newDescription.value = ''
  showCreateModal.value = true
}

async function saveCreate() {
  const ok = await pricingStore.createConfig({
    key: newKey.value.trim(),
    value: newValue.value,
    type: newType.value,
    description: newDescription.value || undefined,
  })
  if (ok) {
    notify(`✓ Config key "${newKey.value}" created`)
    showCreateModal.value = false
  } else {
    notify(pricingStore.error ?? 'Create failed.', 'error')
  }
}

// ─── Publish Changes ──────────────────────────────────────────────────────────
async function publishChanges() {
  const ok = await pricingStore.flushCache()
  if (ok) {
    notify('✓ Changes published — pricing cache cleared. All services will reload fresh values.', 'success')
  } else {
    notify(pricingStore.error ?? 'Publish failed.', 'error')
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  pricingStore.fetchAll()
})
</script>

<template>
  <div class="pricing-page">

    <!-- ── Notification Toast ── -->
    <Transition name="toast">
      <div v-if="notification.show" :class="['toast', `toast-${notification.type}`]">
        <component :is="notification.type === 'success' ? CheckCircle2 : AlertCircle" :size="16" />
        <span>{{ notification.message }}</span>
      </div>
    </Transition>

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon">
          <Settings2 :size="22" />
        </div>
        <div>
          <h1 class="page-title">Pricing Engine</h1>
          <p class="page-subtitle">Manage fees, interest rates, commissions, and product limits</p>
        </div>
      </div>
      <div class="page-header-actions">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="pricingStore.fetchAll()"
          :disabled="pricingStore.loading"
        >
          <Loader2 v-if="pricingStore.loading" :size="14" class="spin" />
          <RefreshCcw v-else :size="14" />
          Refresh
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          @click="publishChanges"
          :disabled="pricingStore.publishing"
        >
          <Loader2 v-if="pricingStore.publishing" :size="14" class="spin" />
          <Save v-else :size="14" />
          {{ pricingStore.publishing ? 'Publishing…' : 'Publish Changes' }}
        </BaseButton>
      </div>
    </div>

    <!-- ── Error Banner ── -->
    <div v-if="pricingStore.error && !pricingStore.loading" class="error-banner">
      <AlertCircle :size="16" />
      <span>{{ pricingStore.error }}</span>
    </div>

    <!-- ── Tabs ── -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="14" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="pricingStore.loading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card" />
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB: Transaction Fees -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="!pricingStore.loading && activeTab === 'fees'">
      <div class="section-toolbar">
        <div class="search-box">
          <Search :size="14" />
          <input v-model="search" placeholder="Search fee keys…" />
        </div>
        <BaseButton variant="primary" size="sm" @click="() => { createTarget = 'fee'; openCreate() }">
          <Plus :size="14" /> New Fee Rule
        </BaseButton>
      </div>

      <Card>
        <div class="config-table-header">
          <span>Config Key</span>
          <span>Description</span>
          <span>Type</span>
          <span>Value</span>
          <span>Last Updated</span>
          <span></span>
        </div>
        <div v-if="feeConfigs.length === 0" class="empty-state">
          <Tag :size="32" />
          <p>No fee rules found. Run the PricingConfigSeeder or create a custom rule.</p>
        </div>
        <div v-for="config in feeConfigs" :key="config.id" class="config-row">
          <div class="config-key">
            <code>{{ config.key }}</code>
            <span :class="['type-badge', getTypeClass(config.type)]">{{ config.type }}</span>
          </div>
          <div class="config-desc">{{ config.description ?? '—' }}</div>
          <div class="config-group">
            <span class="group-chip">{{ getGroupFromKey(config.key) }}</span>
          </div>
          <div class="config-value">
            <strong>{{ formatValue(config) }}</strong>
          </div>
          <div class="config-date">
            {{ config.updated_at ? new Date(config.updated_at).toLocaleDateString() : '—' }}
          </div>
          <div class="config-actions">
            <button class="icon-btn" @click="openEdit(config)" title="Edit">
              <Edit2 :size="14" />
            </button>
          </div>
        </div>
      </Card>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB: Interest Rates -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="!pricingStore.loading && activeTab === 'rates'">
      <div class="section-toolbar">
        <p class="section-note">
          <Zap :size="14" /> These rates are read live by savings services. Changes take effect after "Publish Changes".
        </p>
        <BaseButton variant="primary" size="sm" @click="() => { createTarget = 'rate'; openCreate() }">
          <Plus :size="14" /> Add Rate
        </BaseButton>
      </div>

      <div class="rate-grid">
        <Card v-for="config in rateConfigs" :key="config.id" class="rate-card">
          <div class="rate-card-label">{{ getLabelFromKey(config.key) }}</div>
          <div class="rate-card-subkey"><code>{{ config.key }}</code></div>
          <div class="rate-card-value">{{ formatValue(config) }}</div>
          <div class="rate-card-desc">{{ config.description ?? '' }}</div>
          <button class="rate-edit-btn" @click="openEdit(config)">
            <Edit2 :size="12" /> Edit
          </button>
        </Card>
        <div v-if="rateConfigs.length === 0" class="empty-state">
          <TrendingUp :size="32" />
          <p>No rate configs loaded. Run the PricingConfigSeeder.</p>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB: Agent Commissions -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="!pricingStore.loading && activeTab === 'commissions'">
      <div class="section-toolbar">
        <p class="section-note">
          <Coins :size="14" /> Commission configs control agent payout rates per transaction type.
        </p>
        <BaseButton variant="primary" size="sm" @click="() => { createTarget = 'commission'; openCreate() }">
          <Plus :size="14" /> Add Commission
        </BaseButton>
      </div>
      <Card>
        <div class="config-table-header">
          <span>Config Key</span>
          <span>Description</span>
          <span>Type</span>
          <span>Value</span>
          <span></span>
        </div>
        <div v-if="commissionConfigs.length === 0" class="empty-state">
          <Coins :size="32" />
          <p>No commission configs. Run the PricingConfigSeeder.</p>
        </div>
        <div v-for="config in commissionConfigs" :key="config.id" class="config-row">
          <div class="config-key"><code>{{ config.key }}</code></div>
          <div class="config-desc">{{ config.description ?? '—' }}</div>
          <div class="config-group">
            <span :class="['type-badge', getTypeClass(config.type)]">{{ config.type }}</span>
          </div>
          <div class="config-value"><strong>{{ formatValue(config) }}</strong></div>
          <div class="config-actions">
            <button class="icon-btn" @click="openEdit(config)"><Edit2 :size="14" /></button>
          </div>
        </div>
      </Card>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB: Tax & Compliance -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="!pricingStore.loading && activeTab === 'tax'">
      <div class="section-toolbar">
        <p class="section-note">
          <ShieldCheck :size="14" /> Tax rates reflect Nigerian tax law. Defaults set per CITA / CGT Act. Consult compliance before editing.
        </p>
      </div>
      <Card>
        <div class="config-table-header">
          <span>Config Key</span>
          <span>Description</span>
          <span>Rate</span>
          <span>Last Updated</span>
          <span></span>
        </div>
        <div v-if="taxConfigs.length === 0" class="empty-state">
          <ShieldCheck :size="32" />
          <p>No tax configs. Run the PricingConfigSeeder.</p>
        </div>
        <div v-for="config in taxConfigs" :key="config.id" class="config-row">
          <div class="config-key"><code>{{ config.key }}</code></div>
          <div class="config-desc">{{ config.description ?? '—' }}</div>
          <div class="config-value">
            <strong>{{ (parseFloat(config.value) * 100).toFixed(1) }}%</strong>
          </div>
          <div class="config-date">
            {{ config.updated_at ? new Date(config.updated_at).toLocaleDateString() : '—' }}
          </div>
          <div class="config-actions">
            <button class="icon-btn" @click="openEdit(config)" title="Edit (consult compliance)">
              <Edit2 :size="14" />
            </button>
          </div>
        </div>
      </Card>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB: Product Limits -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="!pricingStore.loading && activeTab === 'limits'">
      <div class="section-toolbar">
        <p class="section-note">
          <Lock :size="14" /> Limits control per-product thresholds, stablecoin tier caps, and virtual card settings.
        </p>
      </div>
      <Card>
        <div class="config-table-header">
          <span>Config Key</span>
          <span>Description</span>
          <span>Type</span>
          <span>Value</span>
          <span></span>
        </div>
        <div v-if="limitConfigs.length === 0" class="empty-state">
          <Lock :size="32" />
          <p>No limit configs. Run the PricingConfigSeeder.</p>
        </div>
        <div v-for="config in limitConfigs" :key="config.id" class="config-row">
          <div class="config-key"><code>{{ config.key }}</code></div>
          <div class="config-desc">{{ config.description ?? '—' }}</div>
          <div class="config-group">
            <span :class="['type-badge', getTypeClass(config.type)]">{{ config.type }}</span>
          </div>
          <div class="config-value"><strong>{{ Number(config.value).toLocaleString() }}</strong></div>
          <div class="config-actions">
            <button class="icon-btn" @click="openEdit(config)"><Edit2 :size="14" /></button>
          </div>
        </div>
      </Card>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- EDIT MODAL -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <BaseModal :show="showEditModal" @close="showEditModal = false" title="Edit Config Value" size="md">
      <div v-if="editingConfig" class="modal-form">
        <div class="modal-config-key">
          <span class="label">Config Key</span>
          <code>{{ editingConfig.key }}</code>
        </div>
        <div class="modal-config-key">
          <span class="label">Description</span>
          <p class="desc-text">{{ editingConfig.description ?? 'No description.' }}</p>
        </div>
        <div class="modal-config-key">
          <span class="label">Type</span>
          <span :class="['type-badge', getTypeClass(editingConfig.type)]">{{ editingConfig.type }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">New Value</label>
          <input
            v-model="editValue"
            :type="editingConfig.type === 'integer' || editingConfig.type === 'float' ? 'number' : 'text'"
            :step="editingConfig.type === 'float' ? '0.001' : '1'"
            class="form-input"
            placeholder="Enter new value…"
          />
          <p v-if="editingConfig.type === 'float' && parseFloat(editValue) < 1" class="form-hint">
            Decimal fraction: {{ (parseFloat(editValue || '0') * 100).toFixed(2) }}%
          </p>
        </div>
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" @click="saveEdit" :disabled="pricingStore.saving">
            <Loader2 v-if="pricingStore.saving" :size="14" class="spin" />
            <Save v-else :size="14" />
            {{ pricingStore.saving ? 'Saving…' : 'Save Change' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- CREATE MODAL -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <BaseModal :show="showCreateModal" @close="showCreateModal = false" title="New Config Key" size="md">
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Config Key <span class="required">*</span></label>
          <input v-model="newKey" class="form-input" placeholder="e.g. fee.transfer.premium" />
          <p class="form-hint">Use dot-notation. Must be lowercase alphanumeric + dots.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Type <span class="required">*</span></label>
          <select v-model="newType" class="form-input">
            <option value="float">float (decimal number)</option>
            <option value="integer">integer (whole number)</option>
            <option value="string">string</option>
            <option value="boolean">boolean (true/false)</option>
            <option value="json">json (JSON object)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Value <span class="required">*</span></label>
          <input
            v-model="newValue"
            :type="newType === 'integer' || newType === 'float' ? 'number' : 'text'"
            class="form-input"
            placeholder="Initial value"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input v-model="newDescription" class="form-input" placeholder="Human-readable description (optional)" />
        </div>
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" @click="saveCreate" :disabled="pricingStore.saving || !newKey || !newValue">
            <Loader2 v-if="pricingStore.saving" :size="14" class="spin" />
            <Plus v-else :size="14" />
            {{ pricingStore.saving ? 'Creating…' : 'Create Key' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.pricing-page { display: flex; flex-direction: column; gap: 20px; padding: 24px; }

/* ── Header ── */
.page-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.page-header-left { display: flex; align-items: center; gap: 14px; }
.page-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, var(--primary, #6366f1), #8b5cf6);
  display: flex; align-items: center; justify-content: center; color: #fff;
  flex-shrink: 0;
}
.page-title { font-size: 1.35rem; font-weight: 700; margin: 0; color: var(--text-primary, #111); }
.page-subtitle { font-size: 0.82rem; color: var(--text-muted, #6b7280); margin: 0; }
.page-header-actions { display: flex; gap: 8px; }

/* ── Error ── */
.error-banner {
  display: flex; gap: 8px; align-items: center; padding: 12px 16px;
  background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;
  color: #dc2626; font-size: 0.85rem;
}

/* ── Tabs ── */
.tab-bar { display: flex; gap: 4px; border-bottom: 1px solid var(--border, #e5e7eb); padding-bottom: 0; flex-wrap: wrap; }
.tab-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border: none; background: none; cursor: pointer; font-size: 0.82rem; font-weight: 500;
  color: var(--text-muted, #6b7280); border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 0.15s; border-radius: 6px 6px 0 0;
}
.tab-btn:hover { color: var(--primary, #6366f1); background: rgba(99,102,241,.06); }
.tab-btn.active { color: var(--primary, #6366f1); border-bottom-color: var(--primary, #6366f1); background: rgba(99,102,241,.06); }

/* ── Skeleton ── */
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.skeleton-card { height: 100px; border-radius: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Section toolbar ── */
.section-toolbar {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px; border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px; background: var(--surface, #fff); width: 240px;
}
.search-box input { border: none; outline: none; font-size: 0.82rem; background: transparent; width: 100%; }
.section-note { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted, #6b7280); margin: 0; }

/* ── Config table ── */
.config-table-header {
  display: grid;
  grid-template-columns: 2fr 2.5fr 80px 120px 100px 44px;
  gap: 8px; padding: 8px 16px; font-size: 0.72rem; font-weight: 600;
  color: var(--text-muted, #6b7280); text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border, #e5e7eb);
}
.config-row {
  display: grid;
  grid-template-columns: 2fr 2.5fr 80px 120px 100px 44px;
  gap: 8px; padding: 12px 16px; align-items: center;
  border-bottom: 1px solid var(--border, #f3f4f6); font-size: 0.82rem;
  transition: background 0.12s;
}
.config-row:last-child { border-bottom: none; }
.config-row:hover { background: var(--surface-2, #f9fafb); }

.config-key { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.config-key code { font-size: 0.78rem; color: var(--primary, #6366f1); }
.config-desc { font-size: 0.79rem; color: var(--text-muted, #6b7280); line-height: 1.4; }
.config-value strong { font-size: 0.88rem; color: var(--text-primary, #111); }
.config-date { font-size: 0.76rem; color: var(--text-muted, #9ca3af); }
.config-group { display: contents; }
.config-actions { display: flex; justify-content: flex-end; }

/* ── Badges ── */
.type-badge { font-size: 0.65rem; font-weight: 600; padding: 2px 7px; border-radius: 999px; text-transform: uppercase; }
.badge-blue   { background: #eff6ff; color: #2563eb; }
.badge-purple { background: #f5f3ff; color: #7c3aed; }
.badge-green  { background: #f0fdf4; color: #16a34a; }
.badge-orange { background: #fff7ed; color: #ea580c; }
.badge-gray   { background: #f3f4f6; color: #6b7280; }

.group-chip { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; background: var(--surface-2, #f3f4f6); color: var(--text-muted, #6b7280); font-weight: 600; }

/* ── Rate grid ── */
.rate-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.rate-card { display: flex; flex-direction: column; gap: 6px; padding: 20px; }
.rate-card-label { font-weight: 700; font-size: 0.88rem; color: var(--text-primary, #111); }
.rate-card-subkey code { font-size: 0.72rem; color: var(--text-muted); }
.rate-card-value { font-size: 1.5rem; font-weight: 800; color: var(--primary, #6366f1); margin: 4px 0; }
.rate-card-desc { font-size: 0.76rem; color: var(--text-muted, #9ca3af); line-height: 1.5; flex: 1; }
.rate-edit-btn {
  display: flex; align-items: center; gap: 4px; margin-top: 8px;
  padding: 5px 10px; font-size: 0.72rem; font-weight: 600;
  border: 1px solid var(--border, #e5e7eb); border-radius: 6px;
  background: none; cursor: pointer; color: var(--text-muted, #6b7280);
  transition: all 0.12s; width: fit-content;
}
.rate-edit-btn:hover { background: var(--primary, #6366f1); color: #fff; border-color: transparent; }

/* ── Icon button ── */
.icon-btn {
  width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border, #e5e7eb);
  background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--text-muted, #6b7280); transition: all 0.12s;
}
.icon-btn:hover { background: var(--primary, #6366f1); color: #fff; border-color: transparent; }

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 56px 24px; color: var(--text-muted, #9ca3af); text-align: center;
}
.empty-state p { font-size: 0.84rem; max-width: 320px; line-height: 1.6; }

/* ── Modal form ── */
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.modal-config-key { display: flex; flex-direction: column; gap: 4px; }
.modal-config-key .label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted, #9ca3af); }
.modal-config-key code { font-size: 0.88rem; color: var(--primary, #6366f1); }
.desc-text { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #374151); }
.form-label .required { color: #ef4444; }
.form-input {
  padding: 9px 12px; border: 1px solid var(--border, #e5e7eb); border-radius: 8px;
  font-size: 0.84rem; background: var(--surface, #fff); color: var(--text-primary, #111);
  outline: none; transition: border 0.12s;
}
.form-input:focus { border-color: var(--primary, #6366f1); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.form-hint { font-size: 0.74rem; color: var(--text-muted, #9ca3af); margin: 0; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; }

/* ── Toast ── */
.toast {
  position: fixed; top: 20px; right: 24px; z-index: 9999;
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  border-radius: 10px; font-size: 0.84rem; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,.12); min-width: 280px; max-width: 480px;
}
.toast-success { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; }
.toast-error   { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; }
.toast-info    { background: #eff6ff; border: 1px solid #93c5fd; color: #1d4ed8; }

/* ── Animations ── */
.toast-enter-active,.toast-leave-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.toast-enter-from,.toast-leave-to { opacity: 0; transform: translateY(-10px) scale(0.96); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 768px) {
  .config-table-header,
  .config-row { grid-template-columns: 2fr 1fr 60px 44px; }
  .config-desc, .config-date { display: none; }
  .rate-grid { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .rate-grid { grid-template-columns: 1fr; }
  .config-table-header, .config-row { grid-template-columns: 1fr 80px 44px; }
  .config-group { display: none; }
}
</style>
