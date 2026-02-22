<script setup lang="ts">
import { 
  Zap, 
  Wallet, 
  Users, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Cpu,
  Monitor,
  ChevronRight,
  ShieldCheck
} from 'lucide-vue-next'
import Card from '../components/misc/Card.vue'
import BaseButton from '../components/forms/BaseButton.vue'

// Transaction Velocity Chart Options
const chartOptions = {
  chart: {
    id: 'transaction-velocity',
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent'
  },
  colors: ['#6366f1', '#22d3ee'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100]
    }
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    strokeDashArray: 4,
    padding: { left: 20, right: 20 }
  },
  xaxis: {
    categories: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b', fontSize: '10px' } }
  },
  yaxis: {
    labels: { style: { colors: '#64748b', fontSize: '10px' } }
  },
  theme: { mode: 'dark' },
  legend: { show: false }
}

const series = [
  { name: 'Inflow', data: [31, 40, 28, 51, 42, 109, 100] },
  { name: 'Outflow', data: [11, 32, 45, 32, 34, 52, 41] }
]

const recentActivity = [
  { id: 1, type: 'KYC Approved', entity: 'Apex Logistics', time: '12 mins ago', icon: Globe, color: 'text-emerald-400' },
  { id: 2, type: 'System Audit', entity: 'Ledger Recon', time: '45 mins ago', icon: Cpu, color: 'text-indigo-400' },
  { id: 3, type: 'High Risk Alert', entity: 'Unknown Flow #8', time: '1h ago', icon: ShieldAlert, color: 'text-rose-400' },
  { id: 4, type: 'Tier Upgrade', entity: 'John Doe', time: '2h ago', icon: Users, color: 'text-cyan-400' }
]
</script>

<template>
  <div class="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Ecosystem Overview</h1>
        <p class="text-slate-400 mt-1">Real-time snapshots of the BlocPoint financial network.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Operational</span>
        </div>
        <BaseButton variant="secondary" size="sm">
          <Activity class="w-4 h-4 mr-2 text-indigo-400" />
          Live Logs
        </BaseButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in [
        { label: 'Network Float', value: '₦ 148.2M', trend: '+12.5%', isUp: true, icon: Wallet, color: 'from-indigo-500/20 to-indigo-500/0' },
        { label: 'Active Agents', value: '1,204', trend: '+3.2%', isUp: true, icon: Users, color: 'from-cyan-500/20 to-cyan-500/0' },
        { label: 'Daily TXN Volume', value: '₦ 4.2M', trend: '-2.1%', isUp: false, icon: Zap, color: 'from-purple-500/20 to-purple-500/0' },
        { label: 'Risk Score', value: '7.4/10', trend: 'Low Risk', isUp: true, icon: ShieldAlert, color: 'from-rose-500/20 to-rose-500/0' }
      ]" :key="stat.label" class="relative group overflow-hidden border-white/5 pb-2">
        <div :class="['absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-80', stat.color]"></div>
        <div class="relative z-10 flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <div class="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <component :is="stat.icon" class="w-5 h-5 text-white" />
            </div>
            <div :class="['px-2 py-0.5 rounded text-[10px] font-bold font-mono', stat.isUp ? 'text-emerald-400 bg-emerald-400/5' : 'text-rose-400 bg-rose-400/5']">
              {{ stat.trend }}
            </div>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-white mt-0.5 tracking-tight">{{ stat.value }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Charts & Main View -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Transaction Velocity Chart (Left 2/3) -->
      <div class="xl:col-span-2 space-y-8">
        <Card title="Transaction Velocity (24h Window)" class="h-full">
          <template #actions>
            <select class="bg-white/5 border border-white/10 rounded-lg py-1 px-3 text-[10px] text-slate-400 focus:outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </template>
          <div class="mt-4 -ml-4">
            <apexchart 
              type="area" 
              height="350" 
              :options="chartOptions" 
              :series="series" 
            />
          </div>
        </Card>
      </div>

      <!-- Right Column: Security & Activity -->
      <div class="space-y-8">
        <!-- System Health -->
        <Card title="System Node Status">
          <div class="space-y-4">
            <div v-for="node in [
              { name: 'Core API (Octane)', status: 'Optimal', delay: '45ms', icon: Monitor },
              { name: 'SoftPOS Relay', status: 'Online', delay: '12ms', icon: Cpu },
              { name: 'Liquidity Vault', status: 'Locked', delay: '-', icon: Zap }
            ]" :key="node.name" class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white/5 rounded-lg text-slate-400">
                  <component :is="node.icon" class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">{{ node.name }}</h4>
                  <p class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ node.status }}</p>
                </div>
              </div>
              <span class="text-[10px] font-mono font-bold text-indigo-400">{{ node.delay }}</span>
            </div>
          </div>
        </Card>

        <!-- Activity Stream -->
        <Card title="Recent Network Events" padding="p-0">
          <div class="divide-y divide-white/5">
            <div v-for="act in recentActivity" :key="act.id" class="p-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors cursor-pointer group">
              <div :class="['w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5', act.color]">
                <component :is="act.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h4 class="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{{ act.type }}</h4>
                  <span class="text-[9px] text-slate-500 uppercase font-mono">{{ act.time }}</span>
                </div>
                <p class="text-[10px] text-slate-500 truncate mt-0.5">{{ act.entity }}</p>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-700 shrink-0 group-hover:text-white transition-colors" />
            </div>
          </div>
          <button class="w-full py-3 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest border-t border-white/5">
            View All Signals
          </button>
        </Card>
      </div>

    </div>

    <!-- Bottom Integrity Banner -->
    <div class="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5">
      <div class="flex items-center gap-6">
        <div class="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ShieldCheck class="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 class="text-lg font-bold text-white">Advanced Cryptographic Verification</h4>
          <p class="text-sm text-slate-400">Your current session is secured with hardware-level HSM modules and verified by the BlocPoint Root CA.</p>
        </div>
      </div>
      <BaseButton variant="primary" class="shrink-0">
        Review Security Audit
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles - can be moved to global if needed */
</style>
