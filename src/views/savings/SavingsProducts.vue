<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance } from '../../utils/format'
import Card from '../../components/misc/Card.vue'

const savingsStore = useSavingsStore()
const products = computed(() => savingsStore.products)
const loading = computed(() => savingsStore.loading)

const editingProduct = ref<any>(null)
const editError      = ref<string | null>(null)
const editForm = ref({
    interest_rate: 0,
    status: 'active'
})

onMounted(() => {
    savingsStore.fetchProducts()
})

const startEdit = (product: any) => {
    editingProduct.value = product
    editError.value = null
    editForm.value = {
        interest_rate: product.interest_rate * 100, // Convert to percentage for display
        status: product.status
    }
}

const saveEdit = async () => {
    if (!editingProduct.value) return
    editError.value = null
    try {
        await savingsStore.updateProduct(editingProduct.value.code, {
            interest_rate: editForm.value.interest_rate / 100, // Convert back to decimal
            status: editForm.value.status
        })
        editingProduct.value = null
    } catch (err: any) {
        editError.value = err.response?.data?.message ?? 'Update failed. Please try again.'
    }
}
</script>

<template>
    <div class="p-6 space-y-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Savings Products</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure interest rates and availability</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card v-for="product in products" :key="product.code" class="relative group overflow-hidden border-white/5">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl">
                                {{ product.code === 'blocflex' ? '💧' : product.code === 'bloclock' ? '🔒' : product.code === 'blocgoal' ? '🎯' : '🔄' }}
                            </div>
                            <div>
                                <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase">{{ product.name }}</h3>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ product.code }}</p>
                            </div>
                        </div>
                        <div :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border', 
                            product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        ]">
                            {{ product.status }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interest Rate</p>
                            <p class="text-xl font-black text-indigo-500">{{ (product.interest_rate * 100).toFixed(1) }}% PA</p>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Min. Amount</p>
                            <p class="text-xl font-black text-slate-800 dark:text-white">{{ formatBalance(product.min_amount) }}</p>
                        </div>
                    </div>

                    <button 
                        @click="startEdit(product)"
                        class="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                    >
                        Modify Configuration
                    </button>
                </div>
            </Card>
        </div>

        <!-- Edit Modal (Backdrop) -->
        <div v-if="editingProduct" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="editingProduct = null"></div>
            <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                <div class="text-center space-y-2">
                    <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Edit {{ editingProduct.name }}</h3>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Reference: {{ editingProduct.code }}</p>
                </div>

                <div class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Annual Interest Rate (%)</label>
                        <div class="relative">
                            <input v-model="editForm.interest_rate" type="number" step="0.1" class="w-full h-16 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">%</span>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Product Status</label>
                        <select v-model="editForm.status" class="w-full h-16 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <button @click="editingProduct = null" class="h-14 bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest">Cancel</button>
                        <button @click="saveEdit" :disabled="loading" class="h-14 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                            {{ loading ? 'Saving...' : 'Apply Changes' }}
                        </button>
                    </div>

                    <!-- Inline error for save failures -->
                    <p v-if="editError" class="text-[10px] text-rose-500 font-bold text-center uppercase tracking-widest">
                        ⚠️ {{ editError }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
