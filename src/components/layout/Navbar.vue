<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  Bars3Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import { 
  Menu, 
  MenuButton, 
  MenuItems, 
  MenuItem,
  TransitionRoot,
  TransitionChild,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'
import { useAuthStore } from '../../stores/auth'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

// Search Logic
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const isSearchFocused = ref(false)

const onBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}

const mockSearchResults = [
  { id: 1, type: 'Agent', name: 'James Wilson', detail: 'Tier 3 • Active', link: '/agents/mock-id' },
  { id: 2, type: 'Transaction', name: 'TXN-9982 - ₦24,500', detail: 'Wallet → Merchant Pay', link: '/transactions' },
  { id: 3, type: 'Wallet', name: 'Settlement Vault', detail: 'Balance: ₦ 124.5M', link: '/wallets' },
  { id: 4, type: 'Agent', name: 'Sarah Ahmed', detail: 'Pending Approval', link: '/agents' }
]

const filteredResults = computed(() => {
  if (!searchQuery.value) return []
  return mockSearchResults.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Notification Logic
const notifications = ref([
  { id: 1, type: 'critical', title: 'AML Alert: High Volume', time: '2 mins ago', read: false },
  { id: 2, type: 'info', title: 'New Agent Registered', time: '15 mins ago', read: false },
  { id: 3, type: 'success', title: 'Settlement Completed', time: '1h ago', read: true },
  { id: 4, type: 'warning', title: 'Low Liquidity Notice', time: '3h ago', read: true }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// Profile Logic
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
    e.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <header class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-dark-bg/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
    <button type="button" class="-m-2.5 p-2.5 text-slate-400 lg:hidden" @click="$emit('toggle-sidebar')">
      <span class="sr-only">Open sidebar</span>
      <Bars3Icon class="h-6 w-6" aria-hidden="true" />
    </button>

    <!-- Desktop Sidebar Toggle -->
    <button type="button" class="hidden lg:flex -m-2.5 p-2.5 text-slate-400 hover:text-white transition-colors" @click="$emit('toggle-sidebar')">
      <span class="sr-only">Toggle sidebar</span>
      <Bars3Icon class="h-6 w-6" aria-hidden="true" />
    </button>

    <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <!-- Global Search -->
      <div class="relative flex flex-1">
        <label for="search-field" class="sr-only">Search</label>
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
          <MagnifyingGlassIcon class="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" aria-hidden="true" />
        </div>
        <input 
          ref="searchInput"
          id="search-field" 
          v-model="searchQuery"
          @focus="isSearchFocused = true"
          @blur="onBlur"
          class="block h-full w-full border-0 py-0 pl-10 pr-0 bg-transparent text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:text-sm" 
          placeholder="Search everything... (Press '/')" 
          type="search" 
        />

        <!-- Search Results Panel -->
        <TransitionRoot
          :show="isSearchFocused && searchQuery.length > 0"
          enter="transition ease-out duration-200"
          enter-from="opacity-0 translate-y-1"
          enter-to="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leave-from="opacity-100 translate-y-0"
          leave-to="opacity-0 translate-y-1"
          class="absolute top-full left-0 mt-2 w-full max-w-lg origin-top-left"
        >
          <div class="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-dark-bg/95 shadow-2xl backdrop-blur-xl">
            <div class="p-3">
              <div v-if="filteredResults.length > 0" class="space-y-1">
                <router-link 
                  v-for="result in filteredResults" 
                  :key="result.id"
                  :to="result.link"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <UserIcon v-if="result.type === 'Agent'" class="w-4 h-4" />
                    <SparklesIcon v-else-if="result.type === 'Transaction'" class="w-4 h-4" />
                    <ShieldCheckIcon v-else class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{{ result.name }}</p>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest">{{ result.type }} • {{ result.detail }}</p>
                  </div>
                  <kbd class="hidden sm:block px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-[9px] font-bold text-slate-600">ENTER</kbd>
                </router-link>
              </div>
              <div v-else class="p-8 text-center">
                <p class="text-sm text-slate-500 italic">No matches found for "{{ searchQuery }}"</p>
              </div>
            </div>
          </div>
        </TransitionRoot>
      </div>

      <div class="flex items-center gap-x-4 lg:gap-x-6">
        <!-- Notification Center -->
        <Popover class="relative">
          <PopoverButton class="-m-2.5 p-2.5 text-slate-400 hover:text-white transition-all relative outline-none group">
            <span class="sr-only">View notifications</span>
            <BellIcon class="h-6 w-6 group-active:scale-90 transition-transform" aria-hidden="true" />
            <span v-if="unreadCount > 0" class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-2 ring-dark-bg bounce-subtle">
              {{ unreadCount }}
            </span>
          </PopoverButton>

          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <PopoverPanel class="absolute right-0 z-50 mt-4 w-80 origin-top-right">
              <div class="glass-panel overflow-hidden rounded-3xl border border-white/10 bg-dark-bg/95 shadow-2xl backdrop-blur-xl">
                <div class="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 class="text-xs font-bold text-white uppercase tracking-widest">Notification Engine</h3>
                  <button @click="notifications.forEach(n => n.read = true)" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">Mark all read</button>
                </div>
                <div class="max-h-96 overflow-y-auto py-2 custom-scrollbar">
                  <router-link 
                    v-for="n in notifications" 
                    :key="n.id" 
                    to="/notifications"
                    class="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 relative block"
                  >
                    <div v-if="!n.read" class="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full"></div>
                    <div :class="[
                      'mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
                      n.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                      n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                    ]">
                      <ExclamationTriangleIcon v-if="n.type === 'critical'" class="w-4 h-4" />
                      <CheckCircleIcon v-else-if="n.type === 'success'" class="w-4 h-4" />
                      <InformationCircleIcon v-else class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{{ n.title }}</p>
                      <p class="text-[10px] text-slate-500 mt-1">{{ n.time }}</p>
                    </div>
                  </router-link>
                </div>
                <div class="p-3 border-t border-white/5 text-center">
                  <router-link to="/notifications">
                    <BaseButton variant="ghost" size="sm" class="w-full text-[10px] font-bold uppercase tracking-widest">View System Logs</BaseButton>
                  </router-link>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <!-- Separator -->
        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true"></div>

        <!-- Profile Dropdown -->
        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-x-3 cursor-pointer outline-none group">
            <div class="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center font-bold text-xs text-indigo-400 group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all uppercase">
              {{ authStore.user?.name?.[0] || 'A' }}
            </div>
            <div class="hidden lg:flex lg:flex-col lg:items-start text-left">
              <span class="text-sm font-bold leading-none text-white transition-colors group-hover:text-indigo-400">{{ authStore.user?.name || 'Admin User' }}</span>
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{{ authStore.user?.roles?.[0]?.replace('_', ' ') || 'Super Admin' }}</span>
            </div>
            <ChevronDownIcon class="w-4 h-4 text-slate-500" />
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <MenuItems class="absolute right-0 z-50 mt-4 w-56 origin-top-right">
              <div class="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-dark-bg/95 shadow-2xl backdrop-blur-xl p-1.5">
                <div class="px-3 py-3 border-b border-white/5">
                  <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connected User</p>
                  <p class="text-xs font-bold text-white truncate mt-1">{{ authStore.user?.email || 'admin@blocpoint.com' }}</p>
                </div>
                
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <router-link
                      to="/profile"
                      :class="[
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400'
                      ]"
                    >
                      <UserIcon class="w-4 h-4" /> Account Identity
                    </router-link>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <router-link
                      to="/audit-logs"
                      :class="[
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400'
                      ]"
                    >
                      <ShieldCheckIcon class="w-4 h-4" /> Security Logs
                    </router-link>
                  </MenuItem>
                </div>

                <div class="pt-1 mt-1 border-t border-white/5">
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="logout"
                      :class="[
                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        active ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-rose-400'
                      ]"
                    >
                      <ArrowRightOnRectangleIcon class="w-4 h-4" /> Sign Out
                    </button>
                  </MenuItem>
                </div>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<style scoped>
.bounce-subtle {
  animation: bounce-subtle 3s infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(-5%) scale(1); }
  50% { transform: translateY(5%) scale(1.05); }
}
</style>
