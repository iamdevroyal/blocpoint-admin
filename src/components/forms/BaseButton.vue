<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-indigo-500 text-white hover:bg-indigo-400 focus:ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]'
    case 'secondary':
      return 'bg-white/5 text-white hover:bg-white/10 focus:ring-white/20 border border-white/10 backdrop-blur-sm'
    case 'danger':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 focus:ring-red-500/50 border border-red-500/20'
    case 'ghost':
      return 'text-slate-400 hover:text-white hover:bg-white/5 focus:ring-white/10'
    default:
      return 'bg-indigo-500 text-white hover:bg-indigo-400 focus:ring-indigo-500/50'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs'
    case 'lg':
      return 'px-6 py-3 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})
</script>

<template>
  <button
    type="button"
    :class="[baseClasses, variantClasses, sizeClasses]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
