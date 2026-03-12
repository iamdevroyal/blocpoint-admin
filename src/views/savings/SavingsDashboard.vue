<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance } from '../../utils/format'

const savingsStore = useSavingsStore()

const stats = computed(() => savingsStore.dashboardStats)
const loading = computed(() => savingsStore.loading)

onMounted(() => {
    savingsStore.fetchDashboardStats()
})

const kpiCards = computed(() => [
    { title: 'Total AUM', value: formatBalance(stats.value?.total_aum || 0), icon: '💰', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Vaults', value: stats.value?.active_vaults_count || 0, icon: '🏦', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Interest Paid (MTD)', value: formatBalance(stats.value?.interest_paid_mtd || 0), icon: '📈', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'RoundUp Adoption', value: `${stats.value?.blocround_adoption_rate || 0}%`, icon: '🔄', color: 'text-purple-500', bg: 'bg-purple-500/10' },
])

// --- Chart Options ---

const pieOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['BlocFlex', 'BlocLock', 'BlocGoal', 'BlocRound'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    dataLabels: { enabled: false },
    legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '75%' } } }
}

const pieSeries = computed(() => [
    stats.value?.product_split?.blocflex || 25,
    stats.value?.product_split?.bloclock || 25,
    stats.value?.product_split?.blocgoal || 25,
    stats.value?.product_split?.blocround || 25
].map(val => Number(val)))

const trendOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
    colors: ['#3b82f6'],
    xaxis: { 
        categories: stats.value?.trend_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 }
}

const trendSeries = computed(() => [
    { name: 'Inflow', data: stats.value?.trend_data || [30, 40, 35, 50, 49, 60, 70] }
])
</script>

<template>
    <div class="p-6 space-y-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Savings Intelligence</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Cross-product performance & liquidity tracking</p>
            </div>
            <button @click="savingsStore.fetchDashboardStats()" 
                class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
            >
                <span :class="{'animate-spin': loading}">🔄</span> Synchronize Data
            </button>
        </div>

        <!-- KPI Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="card in kpiCards" :key="card.title" 
                class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-sm space-y-4 relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
            >
                <div class="flex justify-between items-start relative z-10">
                    <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-2xl', card.bg]">
                        {{ card.icon }}
                    </div>
                    <span class="text-[8px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Live Pulse</span>
                </div>
                <div class="relative z-10">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{{ card.title }}</p>
                    <h3 class="text-3xl font-black tracking-tighter" :class="card.color">{{ card.value }}</h3>
                </div>
                <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" :class="card.bg"></div>
            </div>
        </div>

        <!-- Analytics Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Growth Trend -->
            <div class="lg:col-span-2 p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] space-y-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Growth Trend</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregated daily inflow</p>
                    </div>
                </div>
                <div class="h-[350px]">
                    <apexchart type="area" height="100%" :options="trendOptions" :series="trendSeries" />
                </div>
            </div>

            <!-- Asset Distribution -->
            <div class="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] space-y-8">
                <div class="text-center">
                    <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">AUM Distribution</h4>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Split by product type</p>
                </div>
                <div class="h-[350px] flex items-center justify-center">
                    <apexchart type="donut" width="100%" :options="pieOptions" :series="pieSeries" />
                </div>
            </div>
        </div>
    </div>
</template>
