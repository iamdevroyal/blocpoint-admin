<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Gift, 
  Search, 
  Plus, 
  History, 
  RefreshCcw, 
  TrendingUp, 
  AlertTriangle,
  Tag,
  ChevronRight,
  TrendingDown,
  Activity,
  ShieldCheck,
  Package,
  ArrowUpRight,
  User,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const search = ref('')
const showAddBrandModal = ref(false)
const showRestockModal = ref(false)
const showInventoryDrawer = ref(false)
const showSaleDrawer = ref(false)
const selectedBrand = ref<any>(null)
const selectedSale = ref<any>(null)

const isAddingBrand = ref(false)
const isRestocking = ref(false)

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

const inventory = ref([
  { 
    id: 'GC-AMZ', 
    brand: 'Amazon US', 
    stock: 450, 
    value: '$ 10.00 - $ 500.00', 
    status: 'optimal', 
    last_restock: '2h ago',
    description: 'E-commerce giant gift card. Highly liquid, high demand.',
    vendors: ['Reloadly', 'Xoxoday'],
    avg_delivery: '4.2s'
  },
  { 
    id: 'GC-APL', 
    brand: 'Apple iTunes', 
    stock: 12, 
    value: '$ 25.00 - $ 100.00', 
    status: 'low_stock', 
    last_restock: '5 days ago',
    description: 'App Store & iTunes cards. Low inventory alert active.',
    vendors: ['Reloadly'],
    avg_delivery: '3.8s'
  },
  { 
    id: 'GC-RAZ', 
    brand: 'Razer Gold', 
    stock: 1204, 
    value: 'All Denominations', 
    status: 'optimal', 
    last_restock: '1h ago',
    description: 'Universal gaming credit. Integrated through Xoxoday hub.',
    vendors: ['Xoxoday'],
    avg_delivery: '5.1s'
  }
])

const recentSales = ref([
  { id: 'ORD-8821', brand: 'Amazon US', amount: '$ 100.00', agent: 'John Doe', time: '5 mins ago', status: 'completed', internal_id: 'BP-GFT-9901-X', settlement: '₦ 145,000' },
  { id: 'ORD-8820', brand: 'Razer Gold', amount: '₦ 50,000', agent: 'Sarah Smith', time: '12 mins ago', status: 'completed', internal_id: 'BP-GFT-9902-X', settlement: '₦ 48,500' },
  { id: 'ORD-8819', brand: 'Apple iTunes', amount: '$ 25.00', agent: 'Agent X', time: '45 mins ago', status: 'pending', internal_id: 'BP-GFT-9903-X', settlement: '₦ 36,250' }
])

const restockHistory = [
  { brand: 'Amazon US', amount: '100 Units', date: '2026-02-21 14:00', status: 'success' },
  { brand: 'Razer Gold', amount: '500 Units', date: '2026-02-21 09:30', status: 'success' },
  { brand: 'Apple iTunes', amount: '50 Units', date: '2026-02-18 16:45', status: 'success' }
]

const filteredInventory = computed(() => {
  return inventory.value.filter(item => 
    item.brand.toLowerCase().includes(search.value.toLowerCase()) ||
    item.id.toLowerCase().includes(search.value.toLowerCase())
  )
})

const handleAddBrand = () => {
  isAddingBrand.value = true
  setTimeout(() => {
    isAddingBrand.value = false
    showAddBrandModal.value = false
    showNotification('New brand integration registered successfully.', 'success')
  }, 1500)
}

function openInventoryDetail(item: any) {
  selectedBrand.value = item
  showInventoryDrawer.value = true
}

function openSaleDetail(sale: any) {
  selectedSale.value = sale
  showSaleDrawer.value = true
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Gift class="w-8 h-8 text-pink-500" />
          Digital Gift Inventory
        </h1>
        <p class="text-slate-400 mt-1">Manage global digital assets and automated inventory replenishment.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="showRestockModal = true">
          <RefreshCcw class="w-4 h-4 mr-2" />
          Restock History
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="showAddBrandModal = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Brand
        </BaseButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card v-for="stat in [
        { label: 'Total Valuation', value: '₦ 42.1M', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Pending Sales', value: '18', icon: History, color: 'text-indigo-400' },
        { label: 'Critically Low', value: '2 Brands', icon: AlertTriangle, color: 'text-rose-400' }
      ]" :key="stat.label">
         <div class="flex items-center gap-4">
           <div class="p-3 bg-white/5 rounded-xl">
             <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
           </div>
           <div>
             <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ stat.label }}</span>
             <p class="text-xl font-bold text-white mt-0.5">{{ stat.value }}</p>
           </div>
         </div>
      </Card>
    </div>

    <!-- Main View -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Inventory Grid (Left 2/3) -->
      <div class="xl:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Tag class="w-5 h-5 text-indigo-400" />
            Live Inventory
          </h2>
          <div class="relative w-64">
           <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             v-model="search"
             type="text" 
             placeholder="Search brands..." 
             class="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
           />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card v-for="item in filteredInventory" :key="item.brand" class="group hover:border-indigo-500/30 transition-all cursor-pointer" @click="openInventoryDetail(item)">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white group-hover:bg-indigo-500 transition-colors">
                {{ item.brand[0] }}
              </div>
              <StatusBadge :status="item.status as any" size="sm" class="uppercase text-[8px]" />
            </div>
            <div>
              <h3 class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ item.brand }}</h3>
              <p class="text-[10px] text-slate-500 uppercase font-mono tracking-tighter mt-1">{{ item.id }} • {{ item.value }}</p>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Units In Stock</span>
                <span class="text-xl font-bold text-white font-mono">{{ item.stock }}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Last Restock</span>
                <span class="text-[10px] font-medium text-slate-300">{{ item.last_restock }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Recent Sales -->
      <div class="space-y-6">
         <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <History class="w-5 h-5 text-pink-400" />
            Sale Stream
         </h2>
         <Card padding="p-0">
            <div class="divide-y divide-white/5">
              <div v-for="sale in recentSales" :key="sale.id" class="p-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors cursor-pointer group" @click="openSaleDetail(sale)">
                 <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-pink-500/10 transition-colors">
                    <Gift class="w-5 h-5 text-slate-600 group-hover:text-pink-400 transition-colors" />
                 </div>
                 <div class="flex-1 min-w-0">
                    <div class="flex justify-between">
                      <h4 class="text-xs font-bold text-white truncate">{{ sale.brand }}</h4>
                      <span class="text-[9px] font-mono text-slate-500 uppercase">{{ sale.time }}</span>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-1">{{ sale.agent }} • <span class="text-white">{{ sale.amount }}</span></p>
                 </div>
                 <StatusBadge :status="sale.status as any" size="xs" />
              </div>
            </div>
            <button class="w-full py-4 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest border-t border-white/5 transition-colors">
              View All Orders
            </button>
         </Card>

         <!-- Vendor Health -->
         <Card title="Vendor API Health">
           <div class="space-y-3">
             <div v-for="vendor in [
               { name: 'Reloadly Hub', status: 'Optimal', delay: '1.2s' },
               { name: 'Xoxoday Direct', status: 'Offline', delay: '-' }
             ]" :key="vendor.name" class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div class="flex items-center gap-3">
                  <div :class="['w-1.5 h-1.5 rounded-full', vendor.status === 'Optimal' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse']"></div>
                  <span class="text-xs font-bold text-white">{{ vendor.name }}</span>
                </div>
                <span class="text-[10px] font-mono text-slate-600">{{ vendor.delay }}</span>
             </div>
           </div>
         </Card>
      </div>
    </div>

    <!-- Modals & Drawers -->

    <!-- Add Brand Modal -->
    <BaseModal 
      :show="showAddBrandModal" 
      @close="showAddBrandModal = false"
      title="Add Brand Integration" 
      description="Register a new digital asset provider to the global inventory."
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Brand Name</label>
            <input type="text" placeholder="e.g. Netflix US" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Brand ID</label>
            <input type="text" placeholder="e.g. GC-NET" class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white" />
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Vendor Node</label>
          <select class="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
            <option>Reloadly Hub</option>
            <option>Xoxoday Direct</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="secondary" @click="showAddBrandModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" @click="handleAddBrand" :loading="isAddingBrand">Register Brand</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Restock History Modal -->
    <BaseModal 
      :show="showRestockModal" 
      @close="showRestockModal = false"
      title="Restock Ledger" 
      description="Audit trail of manual and automated inventory replenishment."
      width="lg"
    >
      <div class="space-y-2">
        <div v-for="h in restockHistory" :key="h.date" class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <RefreshCcw class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-bold text-white">{{ h.brand }}</div>
                <div class="text-[9px] text-slate-500">{{ h.date }}</div>
              </div>
           </div>
           <div class="text-right">
              <div class="text-xs font-bold text-emerald-400">+ {{ h.amount }}</div>
              <div class="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Confirmed</div>
           </div>
        </div>
      </div>
    </BaseModal>

    <!-- Inventory Detail Drawer -->
    <BaseDrawer 
      :show="showInventoryDrawer" 
      :title="`Inventory: ${selectedBrand?.brand}`" 
      description="Asset lifecycle and replenishment controls"
      @close="showInventoryDrawer = false"
    >
      <div v-if="selectedBrand" class="space-y-8">
        <div class="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
           <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                 <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                    {{ selectedBrand.brand[0] }}
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider">{{ selectedBrand.id }}</h4>
                    <p class="text-[10px] text-slate-400">API Synced Gateway</p>
                 </div>
              </div>
              <StatusBadge :status="selectedBrand.status" size="md" />
           </div>
           <p class="text-xs text-slate-400 leading-relaxed">{{ selectedBrand.description }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Stock Level</div>
              <div class="text-2xl font-bold text-white font-mono">{{ selectedBrand.stock }}</div>
           </div>
           <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="text-[9px] text-slate-500 font-bold uppercase mb-1">Avg. Delivery</div>
              <div class="text-2xl font-bold text-emerald-400 font-mono">{{ selectedBrand.avg_delivery }}</div>
           </div>
        </div>

        <div class="space-y-4">
           <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Integrated Vendors</h4>
           <div class="space-y-2">
              <div v-for="vendor in selectedBrand.vendors" :key="vendor" class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                 <div class="flex items-center gap-3">
                    <Package class="w-5 h-5 text-indigo-400" />
                    <span class="text-xs font-bold text-white">{{ vendor }}</span>
                 </div>
                 <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    Connected
                 </div>
              </div>
           </div>
        </div>

        <div class="pt-4 space-y-3">
           <BaseButton variant="primary" class="w-full">
             <RefreshCcw class="w-4 h-4 mr-2" /> Trigger Manual Restock
           </BaseButton>
           <BaseButton variant="secondary" class="w-full">
             <TrendingDown class="w-4 h-4 mr-2" /> Update Stock Alerts
           </BaseButton>
        </div>
      </div>
    </BaseDrawer>

    <!-- Sale Detail Drawer -->
    <BaseDrawer 
      :show="showSaleDrawer" 
      :title="`Order Detail: ${selectedSale?.id}`" 
      description="Transaction lifecycle and settlement proof"
      @close="showSaleDrawer = false"
    >
      <div v-if="selectedSale" class="space-y-8">
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
           <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                 <Gift class="w-6 h-6" />
              </div>
              <div>
                 <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ selectedSale.brand }}</div>
                 <div class="text-xl font-bold text-white">{{ selectedSale.amount }}</div>
              </div>
           </div>
           <StatusBadge :status="selectedSale.status" size="md" />
        </div>

        <div class="space-y-4 text-xs">
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Processing Agent</span>
              <span class="text-white font-bold flex items-center gap-1">
                <User class="w-3.5 h-3.5 text-indigo-400" />
                {{ selectedSale.agent }}
              </span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Internal Audit ID</span>
              <span class="text-white font-mono font-bold">{{ selectedSale.internal_id }}</span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Order Timestamp</span>
              <span class="text-white font-bold flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                {{ selectedSale.time }}
              </span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-slate-500">Settlement Value</span>
              <span class="text-emerald-400 font-bold">{{ selectedSale.settlement }}</span>
           </div>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck class="w-6 h-6" />
           </div>
           <div>
              <div class="text-xs font-bold text-white uppercase">Cryptographic Delivery Proof</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Asset successfully delivered to agent wallet vault.</div>
           </div>
        </div>

        <div class="pt-4 grid grid-cols-2 gap-3 border-t border-white/5">
           <BaseButton variant="secondary" size="md" class="w-full">
             <ExternalLink class="w-4 h-4 mr-2" /> Vendor Portal
           </BaseButton>
           <BaseButton variant="secondary" size="md" class="w-full text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/5">
             <Activity class="w-4 h-4 mr-2" /> System Logs
           </BaseButton>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" size="md" class="w-full" @click="showSaleDrawer = false">Acknowledge Order</BaseButton>
      </template>
    </BaseDrawer>

    <!-- Action Notification -->
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
          <component :is="notification.type === 'success' ? ShieldCheck : notification.type === 'error' ? AlertTriangle : Activity" class="w-4 h-4" />
        </div>
        <p class="text-sm font-medium text-white">{{ notification.message }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
