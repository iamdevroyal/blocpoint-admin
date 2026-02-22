<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'max'
}>()

const emit = defineEmits(['close'])

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  max: 'max-w-4xl'
}
</script>

<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              :class="[
                'relative transform overflow-hidden rounded-2xl bg-dark-surface border border-white/10 text-left shadow-2xl transition-all sm:my-8 w-full',
                sizeClasses[size || 'md']
              ]"
            >
              <!-- Glass Header -->
              <div v-if="title" class="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <DialogTitle as="h3" class="text-lg font-bold text-white leading-none">
                  {{ title }}
                </DialogTitle>
                <button
                  type="button"
                  class="rounded-lg p-1 text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                  @click="emit('close')"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="p-6">
                <slot />
              </div>

              <!-- Footer Slot -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
