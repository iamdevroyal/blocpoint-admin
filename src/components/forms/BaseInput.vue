<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | number
  label?: string
  id?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium leading-6 text-slate-300 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative rounded-md shadow-sm">
      <input
        :id="inputId"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all px-3',
          error 
            ? 'ring-red-500/50 focus:ring-red-500 placeholder:text-red-400/50' 
            : 'ring-white/10 focus:ring-indigo-500 placeholder:text-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-500" :id="`${inputId}-error`">{{ error }}</p>
  </div>
</template>
