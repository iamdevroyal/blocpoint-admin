<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Wallet, 
  History, 
  FileText, 
  Settings,
  MoreVertical,
  Download,
  ArrowUpRight,
  Globe,
  Building2,
  AlertOctagon,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  DownloadCloud,
  Lock,
  Mail,
  Fingerprint,
  RefreshCcw,
  UserX
} from 'lucide-vue-next'
import BaseButton from '../../components/forms/BaseButton.vue'
import Card from '../../components/misc/Card.vue'
import StatusBadge from '../../components/badges/StatusBadge.vue'
import BaseModal from '../../components/modals/BaseModal.vue'
import BaseDrawer from '../../components/modals/BaseDrawer.vue'

const route = useRoute()
const agentId = route.params.id

// Navigation / Tabs
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', name: 'Profile Overview', icon: FileText },
  { id: 'ledger', name: 'Float History', icon: History },
  { id: 'documents', name: 'Compliance Docs', icon: ShieldCheck },
  { id: 'settings', name: 'Operational Limits', icon: Settings }
]

// Modal & Drawer State
const showFreezeModal = ref(false)
const showTierModal = ref(false)
const showDocDrawer = ref(false)
const selectedDoc = ref<any>(null)

const freezeForm = reactive({
  reason: '',
  permanent: false
})

const tierForm = reactive({
  newTier: 'Tier 2',
  effectiveDate: new Date().toISOString().split('T')[0]
})

// Mock Data
const ledgerEntries = [
  { id: 'TXN-001', date: '2026-02-21 14:30', type: 'credit', amount: 500000, desc: 'Network Float Top-up', status: 'completed' },
  { id: 'TXN-002', date: '2026-02-21 12:15', type: 'debit', amount: 12500, desc: 'POS Payout - Ref #8821', status: 'completed' },
  { id: 'TXN-003', date: '2026-02-20 16:45', type: 'debit', amount: 4200, desc: 'Transaction Fee Recovery', status: 'completed' },
  { id: 'TXN-004', date: '2026-02-20 09:10', type: 'credit', amount: 1000000, desc: 'Aggregator Transfer', status: 'completed' }
]

const complianceDocs = [
  { id: 1, name: 'Incorporation Certificate', date: 'Oct 14, 2025', type: 'PDF', size: '1.2MB' },
  { id: 2, name: 'Director ID Card', date: 'Oct 14, 2025', type: 'JPG', size: '0.8MB' },
  { id: 3, name: 'Address Proof (Utility)', date: 'Nov 02, 2025', type: 'PDF', size: '2.1MB' },
  { id: 4, name: 'Agency Agreement', date: 'Jan 05, 2026', type: 'PDF', size: '0.5MB' }
]

function openDoc(doc: any) {
  selectedDoc.value = doc
  showDocDrawer.value = true
}

function handleFreeze() {
  console.log('Freezing account:', freezeForm)
  showFreezeModal.value = false
}

function handleTierUpdate() {
  console.log('Updating tier:', tierForm)
  showTierModal.value = false
}

const exportProfile = () => {
  const profileData = {
    ID: agentId,
    Name: 'John Doe',
    Business: 'Doe Retail Ventures Ltd',
    Status: 'Active',
    Tier: 'Tier 2',
    Balance: 1845000.00,
    Joined: '2025-10-12'
  }
  
  const content = Object.entries(profileData).map(([k, v]) => `${k}: ${v}`).join("\n")
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `agent_profile_${agentId}.txt`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Breadcrumbs / Top Actions -->
    <div class="flex items-center justify-between">
      <router-link to="/agents" class="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors group">
        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
          <ArrowLeft class="w-4 h-4" />
        </div>
        <span class="text-sm font-medium">Back to Network</span>
      </router-link>
      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="exportProfile">
          <Download class="w-4 h-4 mr-2" />
          Export Profile
        </BaseButton>
        
        <Menu as="div" class="relative inline-block text-left">
          <MenuButton>
            <BaseButton variant="secondary" size="sm" class="p-2">
              <MoreVertical class="w-4 h-4" />
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
                    <Mail class="mr-3 h-4 w-4 text-indigo-400" />
                    Send Notification
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                    <RefreshCcw class="mr-3 h-4 w-4 text-cyan-400" />
                    Reset Password
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button 
                    @click="showTierModal = true"
                    :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']"
                  >
                    <ArrowUpRight class="mr-3 h-4 w-4 text-emerald-400" />
                    Promote Tier
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button :class="[active ? 'bg-white/5 text-white' : 'text-slate-300', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                    <Fingerprint class="mr-3 h-4 w-4 text-amber-400" />
                    Biometric Rebind
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button 
                    @click="showFreezeModal = true"
                    :class="[active ? 'bg-red-500/10 text-red-500' : 'text-red-400/80', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']"
                  >
                    <Lock class="mr-3 h-4 w-4" />
                    Freeze Operations
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button :class="[active ? 'bg-red-500/20 text-red-500' : 'text-red-400', 'group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors']">
                    <UserX class="mr-3 h-4 w-4" />
                    Terminate Agent
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>

    <!-- Agent Profile Header -->
    <div class="flex flex-col md:flex-row gap-8 items-start">
      <div class="relative">
        <div class="w-24 h-24 rounded-3xl bg-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-indigo-500/20">
          JD
        </div>
        <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dark-bg border-4 border-dark-bg">
          <div class="w-full h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-white tracking-tight">John Doe</h1>
          <StatusBadge status="active" />
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Tier 2 Verified</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <span class="flex items-center gap-1.5"><Building2 class="w-4 h-4 text-slate-500" /> Doe Retail Ventures Ltd</span>
          <span class="flex items-center gap-1.5 font-mono"><FileText class="w-4 h-4 text-slate-500" /> {{ agentId }}</span>
          <span class="flex items-center gap-1.5 capitalize"><Globe class="w-4 h-4 text-slate-500" /> Lagos, Nigeria</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <BaseButton variant="primary" size="md" class="w-full sm:w-48" @click="showTierModal = true">Modify Tier Status</BaseButton>
        <BaseButton variant="danger" size="md" class="w-full sm:w-48" @click="showFreezeModal = true">Freeze Operations</BaseButton>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card class="relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
        <div class="flex items-center gap-3 mb-2">
          <Wallet class="w-4 h-4 text-indigo-400" />
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Available Float</span>
        </div>
        <div class="text-2xl font-bold text-white tracking-tight">₦ 1,845,000.00</div>
        <div class="mt-2 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
          <ArrowUpRight class="w-3 h-3" /> +12.5% from last month
        </div>
      </Card>
      
      <Card class="relative overflow-hidden">
        <div class="flex items-center gap-3 mb-2">
          <ShieldAlert class="w-4 h-4 text-amber-400" />
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Risk Assessment</span>
        </div>
        <div class="flex items-end gap-2">
          <div class="text-2xl font-bold text-white tracking-tight">Low</div>
          <div class="text-sm font-bold text-slate-500 mb-0.5">Score: 12/100</div>
        </div>
        <div class="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
           <div class="h-full bg-emerald-500 w-[12%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </Card>

      <Card class="relative overflow-hidden lg:col-span-2">
         <div class="grid grid-cols-2 gap-4 h-full">
            <div>
               <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">MDT Performance</span>
               <div class="text-xl font-bold text-white leading-tight">₦ 4.2M</div>
               <span class="text-[10px] text-slate-500">128 Transactions</span>
            </div>
            <div class="border-l border-white/5 pl-4">
               <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Service Margin</span>
               <div class="text-xl font-bold text-indigo-400 leading-tight">2.45%</div>
               <span class="text-[10px] text-slate-500">Above average</span>
            </div>
         </div>
      </Card>
    </div>

    <!-- Main Content Area with Navigation -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Tabs Sidebar -->
      <div class="w-full lg:w-64 shrink-0 space-y-1">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
            activeTab === tab.id 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content Panels -->
      <div class="flex-1 space-y-6 min-w-0">
        <transition name="fade" mode="out-in">
          <div :key="activeTab">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="space-y-6 animate-in fade-in duration-300">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Registration Details">
                  <dl class="space-y-4 text-sm">
                    <div v-for="(v, k) in { 'Full Legal Name': 'John Mark Doe', 'Email': 'john.doe@doe-retail.com', 'Phone': '+234 801 234 5678', 'BVN / Tax ID': '222****890' }" :key="k">
                      <dt class="text-slate-500 font-medium mb-1">{{ k }}</dt>
                      <dd class="text-white font-semibold">{{ v }}</dd>
                    </div>
                  </dl>
                </Card>
                <Card title="Business Info">
                  <dl class="space-y-4 text-sm">
                    <div v-for="(v, k) in { 'Company Number': 'RC-992100', 'Incorporation Date': 'October 12, 2018', 'Business Category': 'Retail / POS Operations', 'VAT ID': 'V-98812-LG' }" :key="k">
                      <dt class="text-slate-500 font-medium mb-1">{{ k }}</dt>
                      <dd class="text-white font-semibold">{{ v }}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </div>

            <!-- Ledger Tab -->
            <div v-if="activeTab === 'ledger'" class="space-y-4 animate-in fade-in duration-300">
               <div class="flex justify-between items-center mb-2">
                 <h3 class="text-sm font-bold text-white uppercase tracking-wider">Float Ledger Entries</h3>
                 <BaseButton variant="secondary" size="sm">Download CSV</BaseButton>
               </div>
               <div class="bg-dark-surface border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
                 <table class="w-full text-left">
                   <thead>
                     <tr class="bg-white/[0.02] border-b border-white/5">
                       <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
                       <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                       <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                       <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
                       <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Reference</th>
                     </tr>
                   </thead>
                   <tbody class="divide-y divide-white/5">
                     <tr v-for="entry in ledgerEntries" :key="entry.id" class="hover:bg-white/[0.01] transition-colors group">
                       <td class="px-6 py-4 whitespace-nowrap">
                         <div class="text-sm text-white font-medium">{{ entry.date }}</div>
                       </td>
                       <td class="px-6 py-4 whitespace-nowrap">
                         <div class="flex items-center gap-2">
                           <component :is="entry.type === 'credit' ? ArrowUpCircle : ArrowDownCircle" :class="['w-4 h-4', entry.type === 'credit' ? 'text-emerald-400' : 'text-rose-400']" />
                           <span class="text-xs font-bold uppercase tracking-tighter text-white">{{ entry.type }}</span>
                         </div>
                       </td>
                       <td class="px-6 py-4 whitespace-nowrap">
                         <div :class="['text-sm font-bold font-mono', entry.type === 'credit' ? 'text-emerald-400' : 'text-white']">
                           {{ entry.type === 'credit' ? '+' : '-' }} ₦{{ entry.amount.toLocaleString() }}
                         </div>
                       </td>
                       <td class="px-6 py-4">
                         <div class="text-xs text-slate-400 truncate max-w-[200px]">{{ entry.desc }}</div>
                       </td>
                       <td class="px-6 py-4 text-right">
                         <span class="text-[10px] font-mono font-bold text-slate-600 group-hover:text-indigo-400 transition-colors cursor-pointer underline underline-offset-4 decoration-slate-800">
                           {{ entry.id }}
                         </span>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            <!-- Documents Tab -->
            <div v-if="activeTab === 'documents'" class="space-y-4 animate-in fade-in duration-300">
              <Card v-for="doc in complianceDocs" :key="doc.id" padding="p-4" class="group cursor-pointer hover:border-indigo-500/20 transition-all" @click="openDoc(doc)">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <FileText class="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div class="text-sm font-bold text-white">{{ doc.name }}</div>
                      <div class="text-xs text-slate-500 mt-0.5">Uploaded {{ doc.date }} • {{ doc.type }} • {{ doc.size }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <StatusBadge status="completed" label="Verified" class="text-[10px]" />
                    <BaseButton variant="ghost" size="sm" class="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye class="w-4 h-4" />
                    </BaseButton>
                  </div>
                </div>
              </Card>
            </div>

            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="space-y-6 animate-in fade-in duration-300">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="API Cloud Credentials">
                  <div class="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Lock class="w-5 h-5" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-white">Advanced Security Access</h4>
                      <p class="text-[10px] text-slate-500 mt-0.5">Encryption keys and callbacks are managed by the hardware vault.</p>
                    </div>
                  </div>
                  <div class="mt-6 space-y-4">
                    <BaseButton variant="secondary" size="sm" class="w-full">Rotate Agent Secret</BaseButton>
                    <BaseButton variant="secondary" size="sm" class="w-full">Manage Webhooks</BaseButton>
                  </div>
                </Card>
                <Card title="Threshold Notifications">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-slate-400">Low Balance Alert</span>
                      <span class="text-xs font-bold text-white">₦ 50,000</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-slate-400">High Velocity Flag</span>
                      <span class="text-xs font-bold text-white">₦ 2.5M/day</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Modals & Drawers -->
    
    <!-- Freeze Modal -->
    <BaseModal :show="showFreezeModal" title="Confirm Operation Freeze" size="md" @close="showFreezeModal = false">
      <div class="space-y-6 text-center">
        <div class="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
          <AlertOctagon class="w-10 h-10" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Critical Operational Action</h3>
          <p class="text-sm text-slate-500 mt-1">This will immediately suspend all transaction capabilities for <b>John Doe</b>. This action is logged for compliance auditing.</p>
        </div>
        
        <div class="text-left space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Reason for suspension</label>
          <textarea 
            v-model="freezeForm.reason"
            rows="3"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            placeholder="Document suspected fraud or risk markers..."
          ></textarea>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showFreezeModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="handleFreeze">Confirm Suspension</BaseButton>
      </template>
    </BaseModal>

    <!-- Tier Update Modal -->
    <BaseModal :show="showTierModal" title="Modify Agent Tier" size="md" @close="showTierModal = false">
      <div class="space-y-6">
        <div class="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
          <p class="text-xs text-slate-400">Upgrading the tier allows higher daily volumes and increased float thresholds. Ensure KYC documentation supports this change.</p>
        </div>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">New Operational Tier</label>
            <select v-model="tierForm.newTier" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option>Tier 1 (Restricted)</option>
              <option>Tier 2 (Standard)</option>
              <option>Tier 3 (Enterprise)</option>
              <option>Tier 4 (Custom/Unlimited)</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Effective Date</label>
            <input 
              v-model="tierForm.effectiveDate" 
              type="date" 
              class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showTierModal = false">Discard</BaseButton>
        <BaseButton variant="primary" @click="handleTierUpdate">Update Tier</BaseButton>
      </template>
    </BaseModal>

    <!-- Document viewer Drawer -->
    <BaseDrawer 
      :show="showDocDrawer" 
      :title="selectedDoc?.name" 
      description="Operational compliance document verification"
      width="lg"
      @close="showDocDrawer = false"
    >
      <div class="space-y-8">
        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Type</span>
            <div class="text-xs text-white font-bold">{{ selectedDoc?.type }} Document</div>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Size</span>
            <div class="text-xs text-white font-bold">{{ selectedDoc?.size }}</div>
          </div>
        </div>

        <!-- Document Preview Placeholder -->
        <div class="aspect-[1/1.4] w-full rounded-2xl bg-white/[0.03] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8">
           <DownloadCloud class="w-12 h-12 text-slate-700 mb-4" />
           <p class="text-sm font-medium text-slate-500 italic">Secure document preview is being generated...</p>
           <BaseButton variant="secondary" size="sm" class="mt-6">Open in External Viewer</BaseButton>
        </div>

        <!-- Verification Actions -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Compliance Decision</h4>
          <div class="grid grid-cols-2 gap-3">
            <BaseButton variant="primary" class="bg-emerald-500 hover:bg-emerald-600 border-none">Approve Doc</BaseButton>
            <BaseButton variant="danger" class="bg-rose-500 hover:bg-rose-600 border-none">Reject Doc</BaseButton>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showDocDrawer = false" class="w-full">Close Side Panel</BaseButton>
      </template>
    </BaseDrawer>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from { opacity: 0; transform: translateX(10px); }
.fade-leave-to { opacity: 0; transform: translateX(-10px); }
</style>

