<script setup lang="ts">
defineProps<{
  title?: string
  padding?: string
}>()
</script>

<template>
  <div class="bg-dark-surface rounded-xl shadow-lg border border-white/5 overflow-hidden backdrop-blur-sm">
    <div v-if="title || $slots.header || $slots.actions" class="px-6 py-4 border-b border-white/5 flex items-center justify-between">
      <h3 v-if="title" class="text-base font-semibold leading-6 text-white">{{ title }}</h3>
      <div class="flex items-center gap-4">
        <slot name="header" />
        <slot name="actions" />
      </div>
    </div>
    
    <div :class="padding || 'p-6'">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
      <slot name="footer" />
    </div>
  </div>
</template>
