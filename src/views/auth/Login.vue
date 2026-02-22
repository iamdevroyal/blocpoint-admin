<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, Lock, ChevronRight, ShieldCheck, Globe, Zap } from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Invalid credentials. Please verify your access.'
  }
}

const features = [
  { icon: ShieldCheck, text: 'PCI MPoC Compliant Security' },
  { icon: Globe, text: 'Real-time Global Liquidity' },
  { icon: Zap, text: 'Instant Settlement Engine' }
]
</script>

<template>
  <div class="min-h-screen bg-dark-bg flex relative overflow-hidden">
    <!-- Animated Background Decor -->
    <div class="glow-orb w-[500px] h-[500px] bg-indigo-600/20 -top-20 -left-20"></div>
    <div class="glow-orb w-[400px] h-[400px] bg-purple-600/10 bottom-20 right-20"></div>
    <div class="glow-orb w-[300px] h-[300px] bg-cyan-600/10 top-1/2 left-1/2"></div>

    <!-- Left Content (Visual/Branding) -->
    <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 z-10 border-r border-white/5">
      <div class="flex items-center gap-3">
        <img src="/blocpoint-white.png" alt="BlocPoint" class="h-10 w-auto" />
        </div>

      <div class="max-w-md">
        <h2 class="text-5xl font-bold leading-tight text-white mb-6">
          The future of <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold">financial operations</span> starts here.
        </h2>
        <p class="text-lg text-slate-400 mb-10 leading-relaxed">
          Monitor transaction velocity, manage global liquidity, and enforce compliance workflows from a single, high-performance console.
        </p>

        <div class="space-y-4">
          <div v-for="feat in features" :key="feat.text" class="flex items-center gap-3 text-slate-300">
            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <component :is="feat.icon" class="w-4 h-4 text-indigo-400" />
            </div>
            <span class="text-sm font-medium">{{ feat.text }}</span>
          </div>
        </div>
      </div>

      <div class="text-xs text-slate-500">
        © 2026 BlocPoint Inc. Infrastructure for the digital economy.
      </div>
    </div>

    <!-- Right Content (Login Form) -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 z-10">
      <!-- Mobile Logo -->
      <div class="lg:hidden mb-12 flex items-center gap-3">
        <img src="/blocpoint-white.png" alt="BlocPoint" class="h-8 w-auto" />
        </div>

      <div class="w-full max-w-md">
        <div class="mb-10 text-center lg:text-left">
          <h1 class="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p class="text-slate-400">Enter your credentials to access the admin portal</p>
        </div>

        <div class="glass-panel p-8 rounded-2xl relative overflow-hidden group">
          <!-- Subtle inner glow -->
          <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>

          <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-300 ml-1">Work Email</label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="name@blocpoint.com"
                  required
                  class="form-input-premium w-full pl-10 pr-4"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center ml-1">
                <label class="text-sm font-medium text-slate-300">Password</label>
                <a href="#" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="form-input-premium w-full pl-10 pr-4"
                />
              </div>
            </div>

            <transition name="fade">
              <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <p class="text-xs text-red-500 font-medium">{{ errorMsg }}</p>
              </div>
            </transition>

            <BaseButton
              variant="primary"
              class="w-full py-3.5 group"
              :loading="authStore.loading"
              type="submit"
            >
              <span class="flex items-center gap-2">
                Authorize Session
                <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </BaseButton>
          </form>
        </div>

        <!-- Footer -->
        <div class="mt-8 flex flex-col items-center gap-4">
          <div class="flex items-center gap-6">
            <img src="/blocpoint-fav-white.png" alt="Security" class="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="FIPS 140-2 Compliant" />
            <div class="w-px h-4 bg-white/10"></div>
            <p class="text-xs text-slate-500 font-medium tracking-wide uppercase">Multi-factor required</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
