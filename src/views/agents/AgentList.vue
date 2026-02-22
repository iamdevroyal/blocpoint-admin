<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpRight, 
  MoreHorizontal,
  UserCheck,
  Building2,
  Wallet2,
  Download,
  Ban,
  UserX,
  History,
  ShieldAlert,
  Edit3
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import AgentOnboardingModal from '../../components/modals/AgentOnboardingModal.vue'

// Modal State
const showOnboarding = ref(false)

// Mock data
const search = ref('')
const filterStatus = ref('all')
const filterTier = ref('all')

const agents = ref([
  { id: 'agt_x98124', name: 'John Doe', business: 'Doe Retail', tier: 'Tier 1', status: 'active', balance: 125000.00, volume: 450000.00, phone: '08012345678' },
  { id: 'agt_y82133', name: 'Jane Smith', business: 'Smith Goods', tier: 'Tier 2', status: 'pending', balance: 0.00, volume: 0.00, phone: '08098765432' },
  { id: 'agt_z12345', name: 'Femi Adebayo', business: 'Femi Electronics', tier: 'Tier 3', status: 'active', balance: 2450500.25, volume: 15400000.00, phone: '07011223344' },
  { id: 'agt_a67890', name: 'Amaka Obi', business: 'Obi Fashion', tier: 'Tier 1', status: 'suspended', balance: 45000.00, volume: 120000.00, phone: '09055443322' },
])

const filteredAgents = computed(() => {
  return agents.value.filter(agent => {
    const query = search.value.toLowerCase()
    const matchesSearch = agent.name.toLowerCase().includes(query) || 
                         agent.id.toLowerCase().includes(query) || 
                         agent.business.toLowerCase().includes(query) ||
                         agent.phone.includes(query)
    
    const matchesStatus = filterStatus.value === 'all' || agent.status === filterStatus.value
    const matchesTier = filterTier.value === 'all' || agent.tier === filterTier.value
    
    return matchesSearch && matchesStatus && matchesTier
  })
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
}

const exportCSV = () => {
  const headers = ['ID', 'Name', 'Business', 'Tier', 'Status', 'Balance', 'Volume']
  const data = filteredAgents.value.map(a => [a.id, a.name, a.business, a.tier, a.status, a.balance, a.volume])
  const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `agent_network_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Agent Network</h1>
        <p class="text-slate-400 mt-1">Manage, approve, and monitor active agents in the ecosystem.</p>
      </div>
      <BaseButton variant="primary" class="group" @click="showOnboarding = true">
        <Plus class="w-4 h-4 mr-2" />
        Onboard New Agent
      </BaseButton>
    </div>

    <!-- Agent Onboarding Modal -->
    <AgentOnboardingModal 
      :show="showOnboarding" 
      @close="showOnboarding = false"
      @success="() => console.log('Refresh list')"
    />

    <!-- Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(stat, i) in [
        { label: 'Total Agents', value: '1,204', icon: UserCheck, color: 'text-indigo-400' },
        { label: 'Active Tiers', value: '3', icon: Building2, color: 'text-emerald-400' },
        { label: 'Network Float', value: '₦ 48.2M', icon: Wallet2, color: 'text-cyan-400' },
        { label: 'Pending KYC', value: '14', icon: SlidersHorizontal, color: 'text-amber-400' }
      ]" :key="i" class="glass-panel p-5 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="glass-panel rounded-2xl overflow-hidden">
      <!-- Action Bar -->
      <div class="p-5 flex flex-col lg:flex-row gap-4 justify-between items-center border-b border-white/5 bg-white/[0.01]">
        <div class="relative w-full lg:w-[450px] flex items-center gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              v-model="search"
              type="text" 
              placeholder="Search name, ID, business or phone..." 
              class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <select 
            v-model="filterStatus"
            class="hidden sm:block bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <select 
            v-model="filterTier"
            class="hidden sm:block bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="all">All Tiers</option>
            <option value="Tier 1">Tier 1</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Tier 3">Tier 3</option>
          </select>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>
          <BaseButton variant="ghost" size="sm" @click="exportCSV" class="flex items-center gap-2">
            <Download class="w-4 h-4" />
            Export CSV
          </BaseButton>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="text-slate-500 font-semibold border-b border-white/5 bg-white/[0.02]">
              <th class="px-6 py-4">Agent Identification</th>
              <th class="px-6 py-4">Status & Compliance</th>
              <th class="px-6 py-4">Float Balance</th>
              <th class="px-6 py-4">MTD Volume</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="agent in filteredAgents" :key="agent.id" class="hover:bg-white/[0.03] transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    {{ agent.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div>
                    <div class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ agent.name }}</div>
                    <div class="text-xs text-slate-500 mt-0.5 font-mono">{{ agent.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <StatusBadge :status="agent.status as any" />
                  <span class="text-[10px] font-bold uppercase tracking-tighter text-slate-500 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                    {{ agent.tier }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-white font-semibold">
                {{ formatCurrency(agent.balance) }}
              </td>
              <td class="px-6 py-4">
                <div class="text-slate-300 font-medium">{{ formatCurrency(agent.volume) }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link :to="`/agents/${agent.id}`">
                    <BaseButton variant="ghost" size="sm" class="h-9 w-9 p-0" title="View Details">
                      <ArrowUpRight class="w-4 h-4" />
                    </BaseButton>
                  </router-link>
                  
                  <Menu as="div" class="relative inline-block text-left">
                    <MenuButton>
                      <BaseButton variant="ghost" size="sm" class="h-9 w-9 p-0">
                        <MoreHorizontal class="w-4 h-4" />
                      </BaseButton>
                    </MenuButton>

                    <transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/5 rounded-xl bg-[#1a1f2e] border border-white/10 shadow-2xl focus:outline-none z-50">
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <Edit3 class="mr-3 h-4 w-4 text-indigo-400" />
                              Edit Profile
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <History class="mr-3 h-4 w-4 text-cyan-400" />
                              View Ledgers
                            </button>
                          </MenuItem>
                        </div>
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <ShieldAlert class="mr-3 h-4 w-4 text-amber-400" />
                              Audit Security
                            </button>
                          </MenuItem>
                        </div>
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-red-500/10 text-red-500' : 'text-red-400/80', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <Ban class="mr-3 h-4 w-4" />
                              Freeze Agent
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button :class="[active ? 'bg-red-500/20 text-red-500' : 'text-red-400', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                              <UserX class="mr-3 h-4 w-4" />
                              Terminate Account
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </transition>
                  </Menu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest bg-white/[0.01]">
        <span>Showing {{ filteredAgents.length }} of {{ agents.length }} agents</span>
        <div class="flex gap-2">
          <BaseButton variant="secondary" size="sm" disabled>Previous</BaseButton>
          <BaseButton variant="secondary" size="sm" disabled>Next</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
