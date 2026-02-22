<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'active' | 'pending' | 'suspended' | 'completed' | 'failed' | 'processing'
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'active':
    case 'completed':
      return { class: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', label: props.status }
    case 'suspended':
    case 'failed':
      return { class: 'bg-red-500/10 text-red-400 ring-red-500/20', label: props.status }
    case 'pending':
    case 'processing':
      return { class: 'bg-amber-500/10 text-amber-400 ring-amber-500/20', label: props.status }
    default:
      return { class: 'bg-slate-500/10 text-slate-400 ring-slate-500/20', label: props.status }
  }
})
</script>

<template>
  <span 
    class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize"
    :class="statusConfig.class"
  >
    {{ statusConfig.label }}
  </span>
</template>
