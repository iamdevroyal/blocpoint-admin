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
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  ChevronRight,
  Fingerprint,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  RefreshCcw,
  ShieldAlert,
  Info
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import Card from '../../components/misc/Card.vue'
import BaseButton from '../../components/forms/BaseButton.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'

const authStore = useAuthStore()
const isSaving = ref(false)
const isUploading = ref(false)
const showPasswordModal = ref(false)
const notification = ref<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({ 
  show: false, 
  message: '', 
  type: 'success' 
})

function showNotify(msg: string, type: 'success' | 'error' | 'info' = 'success') {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 3000)
}

const profileForm = ref({
  name: authStore.user?.name || 'Dev Admin',
  email: authStore.user?.email || 'admin@blocpoint.com',
  timezone: 'UTC+1 (Lagos)',
  language: 'English (US)',
  notifications: true,
  marketing: false
})

const avatarPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    isUploading.value = true
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
      setTimeout(() => {
        isUploading.value = false
        showNotify('Profile avatar updated successfully.')
      }, 1500)
    }
    reader.readAsDataURL(file)
  }
}

function handleSaveProfile() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    showNotify('Profile identity parameters synchronized.')
  }, 1500)
}

// Password Logic
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})
const showPwd = ref(false)
const isUpdatingPassword = ref(false)

function handleUpdatePassword() {
  if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
    showNotify('Please fill in all password fields.', 'error')
    return
  }
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showNotify('New passwords do not match.', 'error')
    return
  }
  isUpdatingPassword.value = true
  setTimeout(() => {
    isUpdatingPassword.value = false
    showPasswordModal.value = false
    passwordForm.value = { current: '', new: '', confirm: '' }
    showNotify('Security credentials rotated successfully.')
  }, 2000)
}

// Security Toggles
const securitySettings = ref({
  mfa: true,
  biometrics: false,
  sessionHardening: true
})

function toggleMFA() {
  const newState = !securitySettings.value.mfa
  showNotify(`${newState ? 'Enabled' : 'Disabled'} multi-factor authentication.`, 'info')
  securitySettings.value.mfa = newState
}

function toggleBiometrics() {
  const newState = !securitySettings.value.biometrics
  showNotify(`${newState ? 'Activated' : 'Paused'} biometric security layer.`, 'info')
  securitySettings.value.biometrics = newState
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <div>
      <h2 class="text-2xl font-bold text-white uppercase tracking-tight">Account Identity</h2>
      <p class="text-slate-400">Manage your administrative profile, security credentials, and platform preferences.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Profile Card -->
      <div class="lg:col-span-1 space-y-6">
        <Card no-padding class="overflow-hidden bg-indigo-500/5 border-indigo-500/10">
          <div class="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative">
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
            <button 
              @click="triggerFileInput"
              class="absolute bottom-4 right-4 p-2 bg-dark-bg/80 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors z-10"
              :disabled="isUploading"
            >
              <Camera v-if="!isUploading" class="w-4 h-4" />
              <RefreshCcw v-else class="w-4 h-4 animate-spin text-indigo-400" />
            </button>
          </div>
          <div class="px-6 pb-6 relative">
            <div class="-mt-12 mb-4">
              <div class="w-24 h-24 rounded-3xl bg-indigo-500 border-4 border-dark-bg flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden group">
                <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
                <span v-else>{{ profileForm.name[0] }}</span>
                <div v-if="isUploading" class="absolute inset-0 bg-dark-bg/60 flex items-center justify-center">
                  <Upload class="w-6 h-6 text-indigo-400 animate-bounce" />
                </div>
              </div>
            </div>
            <h3 class="text-lg font-bold text-white">{{ profileForm.name }}</h3>
            <p class="text-xs text-slate-500 font-mono mb-4">{{ profileForm.email }}</p>
            <div class="flex flex-wrap gap-2 mb-6">
              <StatusBadge v-for="role in authStore.user?.roles" :key="role" status="active" size="sm" class="uppercase text-[9px] font-bold">
                {{ (role as string).replace('_', ' ') }}
              </StatusBadge>
            </div>
            
            <div class="space-y-3 pt-6 border-t border-white/5">
              <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Account Status</span>
                <span class="text-emerald-400">Verified</span>
              </div>
              <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Last Login</span>
                <span class="text-white font-mono">Today, 09:12 AM</span>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="p-6" class="bg-amber-500/5 border-amber-500/10">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Security Rating</h4>
              <p class="text-[11px] text-slate-500">Your account is well protected.</p>
            </div>
          </div>
          <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div class="bg-amber-500 h-full w-[85%]"></div>
          </div>
          <p class="text-[10px] text-slate-500 mt-3 italic">Tip: Enable hardware key for 100% rating.</p>
        </Card>
      </div>

      <!-- Right Column: Settings Form -->
      <div class="lg:col-span-2 space-y-8">
        <Card title="General Profile Information" padding="p-6">
           <form @submit.prevent="handleSaveProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div class="relative">
                       <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input v-model="profileForm.name" type="text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                 </div>
                 <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Endpoint</label>
                    <div class="relative">
                       <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input v-model="profileForm.email" type="email" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                 </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Language</label>
                    <div class="relative">
                       <Globe class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <select v-model="profileForm.language" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                          <option>English (US)</option>
                          <option>French (FR)</option>
                       </select>
                    </div>
                 </div>
                 <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Timezone Offset</label>
                    <div class="relative">
                       <History class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <select v-model="profileForm.timezone" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                          <option>UTC+1 (Lagos)</option>
                          <option>UTC+0 (London)</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div class="pt-4 flex justify-end">
                 <BaseButton variant="primary" :loading="isSaving" type="submit">
                    <Save class="w-4 h-4 mr-2" />
                    Persist Identity Changes
                 </BaseButton>
              </div>
           </form>
        </Card>

        <Card title="Security & Authentication" padding="p-0">
           <div class="divide-y divide-white/5">
              <div class="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group" @click="showPasswordModal = true">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                       <Key class="w-5 h-5" />
                    </div>
                    <div>
                       <h5 class="text-sm font-bold text-white">Master Password</h5>
                       <p class="text-[11px] text-slate-500">Last updated 3 months ago. Ensure it's complex.</p>
                    </div>
                 </div>
                 <BaseButton variant="ghost" size="sm" class="text-indigo-400">Update Profile Secret</BaseButton>
              </div>

              <div class="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group" @click="toggleMFA">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                       <Smartphone class="w-5 h-5" />
                    </div>
                    <div>
                       <h5 class="text-sm font-bold text-white">Two-Factor Auth (2FA)</h5>
                       <p class="text-[11px] text-slate-500">Authenticator app is currently <span :class="securitySettings.mfa ? 'text-emerald-400' : 'text-rose-400'" class="font-bold uppercase">{{ securitySettings.mfa ? 'Active' : 'Disabled' }}</span>.</p>
                    </div>
                 </div>
                 <BaseButton variant="ghost" size="sm" :class="securitySettings.mfa ? 'text-rose-400' : 'text-emerald-400'">
                    {{ securitySettings.mfa ? 'Deactivate' : 'Enable' }}
                 </BaseButton>
              </div>

              <div class="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group" @click="toggleBiometrics">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                       <Fingerprint class="w-5 h-5" />
                    </div>
                    <div>
                       <h5 class="text-sm font-bold text-white">Biometric Locks</h5>
                       <p class="text-[11px] text-slate-500">Status: <span :class="securitySettings.biometrics ? 'text-indigo-400' : 'text-slate-600'" class="font-bold uppercase">{{ securitySettings.biometrics ? 'Active' : 'Inactive' }}</span>.</p>
                    </div>
                 </div>
                 <BaseButton variant="ghost" size="sm" class="text-indigo-400">
                    {{ securitySettings.biometrics ? 'Configure' : 'Enable' }}
                 </BaseButton>
              </div>
           </div>
        </Card>
      </div>
    </div>

    <!-- Password Modal -->
    <BaseModal 
      :show="showPasswordModal" 
      @close="showPasswordModal = false"
      title="Rotate Security Credentials"
      description="Updating your master password invalidates all existing sessions (except this one)."
    >
      <form @submit.prevent="handleUpdatePassword" class="space-y-6">
        <div class="space-y-4">
           <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
              <div class="relative">
                 <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                 <input 
                  v-model="passwordForm.current"
                  :type="showPwd ? 'text' : 'password'" 
                  class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                 />
                 <button type="button" @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                    <component :is="showPwd ? EyeOff : Eye" class="w-4 h-4" />
                 </button>
              </div>
           </div>
           
           <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                 <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                 <input v-model="passwordForm.new" type="password" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div class="space-y-1.5">
                 <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New</label>
                 <input v-model="passwordForm.confirm" type="password" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
           </div>
        </div>

        <div class="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
           <ShieldAlert class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
           <p class="text-[10px] text-slate-400 leading-relaxed italic">Password must be at least 12 characters and include a mixture of uppercase, lowercase, numbers, and symbols.</p>
        </div>

        <div class="flex gap-3 pt-4">
           <BaseButton variant="secondary" class="flex-1" @click="showPasswordModal = false">Cancel</BaseButton>
           <BaseButton variant="primary" class="flex-1" type="submit" :loading="isUpdatingPassword">Rotate Password</BaseButton>
        </div>
      </form>
    </BaseModal>

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
          <component :is="notification.type === 'success' ? CheckCircle2 : notification.type === 'error' ? AlertTriangle : Info" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>
  </div>
</template>
