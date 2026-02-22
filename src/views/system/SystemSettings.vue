<script setup lang="ts">
import { ref } from 'vue'
import { 
  GlobeAltIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
  KeyIcon,
  BoltIcon,
  CommandLineIcon
} from '@heroicons/vue/24/outline'
import BaseButton from '../../components/forms/BaseButton.vue'
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-vue-next'

const tabs = [
  { id: 'general', name: 'General', icon: GlobeAltIcon },
  { id: 'financials', name: 'Financials', icon: BanknotesIcon },
  { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon },
  { id: 'integrations', name: 'Integrations', icon: PuzzlePieceIcon },
  { id: 'security', name: 'Security', icon: KeyIcon },
]

const activeTab = ref('general')
const isSaving = ref(false)
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

const settings = ref({
  siteName: 'BlocPoint Operations',
  maintenanceMode: false,
  globalDailyLimit: 10000000,
  defaultCurrency: 'NGN',
  settlementPeriod: 'T+0',
  kycRequired: true,
  riskThreshold: 80,
  yellowCardApiKey: '••••••••••••••••',
  firsMerchantId: 'BP-FIRS-2026-X',
  sessionTimeout: 30,
  enforce2FA: true
})

function saveSettings() {
  isSaving.value = true
  showNotification('Propagating system-wide configuration updates...', 'info')
  
  setTimeout(() => {
    isSaving.value = false
    showNotification('System configuration persisted and active.', 'success')
  }, 2000)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">System Settings</h2>
        <p class="text-slate-400">Configure global platform parameters and integration endpoints</p>
      </div>
      <BaseButton 
        variant="primary"
        size="md"
        @click="saveSettings"
        :loading="isSaving"
        class="shadow-lg shadow-indigo-500/20"
      >
        <BoltIcon class="w-4 h-4 mr-2" />
        Save Configuration
      </BaseButton>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Tabs Navigation -->
      <aside class="w-full lg:w-64 shrink-0">
        <div class="glass-panel p-2 rounded-xl border border-white/5 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="activeTab === tab.id 
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            {{ tab.name }}
          </button>
        </div>
      </aside>

      <!-- Tab Content -->
      <main class="flex-1 min-w-0">
        <div class="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon class="w-5 h-5 text-indigo-400" />
              General Platform Identity
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Platform Name</label>
                <input v-model="settings.siteName" type="text" class="form-input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Maintenance Mode</label>
                <div class="flex items-center gap-3 h-11">
                  <button 
                    @click="settings.maintenanceMode = !settings.maintenanceMode"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'"
                  >
                    <span 
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" 
                      :class="settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                  <span class="text-sm font-medium" :class="settings.maintenanceMode ? 'text-red-400' : 'text-slate-400'">
                    {{ settings.maintenanceMode ? 'ACTIVE (Public Access Disabled)' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Settings -->
          <div v-if="activeTab === 'financials'" class="space-y-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BanknotesIcon class="w-5 h-5 text-indigo-400" />
              Financial Core Configuration
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Global Daily Limit (₦)</label>
                <input v-model.number="settings.globalDailyLimit" type="number" class="form-input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Operating Currency</label>
                <select v-model="settings.defaultCurrency" class="form-input-premium w-full bg-dark-bg">
                  <option value="NGN">Naira (NGN)</option>
                  <option value="USD">Dollar (USD)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Settlement Engine Period</label>
                <select v-model="settings.settlementPeriod" class="form-input-premium w-full bg-dark-bg">
                  <option value="T+0">Instant (T+0)</option>
                  <option value="T+1">Next Day (T+1)</option>
                  <option value="T+2">Standard (T+2)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Compliance Settings -->
          <div v-if="activeTab === 'compliance'" class="space-y-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheckIcon class="w-5 h-5 text-indigo-400" />
              Risk & Compliance Parameters
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Enforce KYC for Transfers</label>
                <div class="flex items-center gap-3 h-11">
                  <button 
                    @click="settings.kycRequired = !settings.kycRequired"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="settings.kycRequired ? 'bg-indigo-500' : 'bg-slate-700'"
                  >
                    <span 
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" 
                      :class="settings.kycRequired ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                  <span class="text-sm font-medium text-slate-400">Strict Enforcement</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Fraud Alert Threshold (%)</label>
                <div class="flex items-center gap-4">
                  <input v-model="settings.riskThreshold" type="range" min="0" max="100" class="flex-1 accent-indigo-500" />
                  <span class="text-sm font-mono text-indigo-400 w-8">{{ settings.riskThreshold }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Integrations Settings -->
          <div v-if="activeTab === 'integrations'" class="space-y-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PuzzlePieceIcon class="w-5 h-5 text-indigo-400" />
              External Service Gateways
            </h3>
            
            <div class="space-y-6">
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img src="https://www.google.com/s2/favicons?domain=yellowcard.io" class="w-5 h-5 rounded" />
                    <span class="font-medium text-white">Yellow Card Integration</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-tight">Connected</span>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500">API Key</label>
                  <div class="relative">
                    <input v-model="settings.yellowCardApiKey" type="password" class="form-input-premium w-full text-xs font-mono" />
                    <button class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      <CommandLineIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-[10px] font-bold text-white">F</span>
                    <span class="font-medium text-white">FIRS Tax Reporting</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase tracking-tight">Staging</span>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Merchant Reference ID</label>
                  <input v-model="settings.firsMerchantId" type="text" class="form-input-premium w-full text-xs font-mono" />
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldExclamationIcon class="w-5 h-5 text-indigo-400" />
              Advanced Security Hardening
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Session Max Lifetime (Minutes)</label>
                <input v-model.number="settings.sessionTimeout" type="number" class="form-input-premium w-full " />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Enforce Admin 2FA</label>
                <div class="flex items-center gap-3 h-11">
                  <button 
                    @click="settings.enforce2FA = !settings.enforce2FA"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="settings.enforce2FA ? 'bg-indigo-500' : 'bg-slate-700'"
                  >
                    <span 
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" 
                      :class="settings.enforce2FA ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                  <span class="text-sm font-medium text-slate-400">Required for Privileged Ops</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

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
