<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  BanknotesIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  WalletIcon,
  GiftIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  ArrowsRightLeftIcon,
  ListBulletIcon,
  BellAlertIcon,
  Cog6ToothIcon, 
  TagIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  collapsed?: boolean
}>()

const navigation = [
  { 
    name: 'Overview', 
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Agents', href: '/agents', icon: UsersIcon },
      { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    ]
  },
  {
    name: 'Financials',
    items: [
      { name: 'Wallets', href: '/wallets', icon: WalletIcon },
      { name: 'Treasury', href: '/treasury', icon: PresentationChartLineIcon },
      { name: 'Ledger', href: '/ledger', icon: DocumentChartBarIcon },
      { name: 'Reconciliation', href: '/reconciliation', icon: ArrowsRightLeftIcon },
    ]
  },
  {
    name: 'Digital Assets',
    items: [
      { name: 'Gift Cards', href: '/giftcards', icon: GiftIcon },
      { name: 'Stablecoins', href: '/stablecoins', icon: CurrencyDollarIcon },
    ]
  },
  {
    name: 'Security & Ops',
    items: [
      { name: 'Compliance', href: '/compliance', icon: ShieldCheckIcon },
      { name: 'Risk Alerts', href: '/alerts', icon: BellAlertIcon },
      { name: 'Audit Logs', href: '/audit-logs', icon: ListBulletIcon },
    ]
  },
  {
    name: 'System',
    items: [
      { name: 'Pricing Engine', href: '/system/pricing', icon: TagIcon },
      { name: 'Settings', href: '/system/settings', icon: Cog6ToothIcon },
    ]
  }
]
</script>

<template>
  <div 
    class="flex h-full flex-col border-r border-white/10 bg-dark-bg/80 backdrop-blur-md transition-all duration-300"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <div 
      class="flex h-16 shrink-0 items-center border-b border-white/5 transition-all duration-300 overflow-hidden"
      :class="collapsed ? 'justify-center px-0' : 'px-6'"
    >
      <div class="flex items-center justify-center transition-all duration-300">
        <img 
          :src="collapsed ? '/blocpoint-fav-white.png' : '/blocpoint-white.png'" 
          alt="BlocPoint" 
          :class="collapsed ? 'h-8' : 'h-7'" 
          class="shrink-0 transition-all duration-300" 
        />
      </div>
    </div>
    <nav class="flex flex-1 flex-col px-4 pt-6 overflow-y-auto pb-8 custom-scrollbar">
      <div v-for="section in navigation" :key="section.name" class="mb-6">
        <h3 
          v-if="!collapsed" 
          class="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 whitespace-nowrap overflow-hidden transition-all duration-300"
        >
          {{ section.name }}
        </h3>
        <div v-else class="h-4"></div>
        <ul role="list" class="flex flex-col gap-y-1">
          <li v-for="item in section.items" :key="item.name">
            <RouterLink
              :to="item.href"
              class="group flex items-center gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              :class="collapsed ? 'justify-center' : ''"
              active-class="bg-indigo-500/10 text-indigo-400"
              :title="collapsed ? item.name : ''"
            >
              <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
              <span v-if="!collapsed" class="whitespace-nowrap overflow-hidden transition-all duration-300">{{ item.name }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
