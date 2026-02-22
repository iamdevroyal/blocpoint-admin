<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title?: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}>()

const emit = defineEmits(['close'])

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
}
</script>

<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <DialogPanel :class="['pointer-events-auto w-screen', widthClasses[width || 'md']]">
                <div class="flex h-full flex-col overflow-y-scroll bg-dark-surface border-l border-white/10 shadow-2xl">
                  <!-- Header -->
                  <div class="px-6 py-6 border-b border-white/5 bg-white/[0.01]">
                    <div class="flex items-start justify-between">
                      <div>
                        <DialogTitle class="text-xl font-bold text-white tracking-tight">
                          {{ title }}
                        </DialogTitle>
                        <p v-if="description" class="mt-1 text-sm text-slate-500">
                          {{ description }}
                        </p>
                      </div>
                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="rounded-lg p-2 text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                          @click="emit('close')"
                        >
                          <X class="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="relative flex-1 p-6">
                    <slot />
                  </div>

                  <!-- Footer -->
                  <div v-if="$slots.footer" class="border-t border-white/5 px-6 py-6 bg-white/[0.02] flex justify-end gap-3">
                    <slot name="footer" />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
