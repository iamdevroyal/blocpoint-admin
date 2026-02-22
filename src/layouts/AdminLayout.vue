<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const route = useRoute()

// Close mobile sidebar on navigation
watch(() => route.path, () => {
  sidebarOpen.value = false
})

function handleToggleSidebar() {
  if (window.innerWidth >= 1024) {
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    sidebarOpen.value = !sidebarOpen.value
  }
}
</script>

<template>
  <div class="flex h-screen w-full bg-dark-bg overflow-hidden text-slate-100 selection:bg-indigo-500/30">
    <!-- Mobile Sidebar -->
    <div v-if="sidebarOpen" class="relative z-50 lg:hidden" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm transition-opacity" @click="sidebarOpen = false"></div>

      <div class="fixed inset-0 flex">
        <div class="relative mr-16 flex w-full max-w-xs flex-1 transition-transform">
          <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
              <span class="sr-only">Close sidebar</span>
              <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <Sidebar :collapsed="false" />
        </div>
      </div>
    </div>

    <!-- Static Desktop Sidebar -->
    <Sidebar 
      class="hidden lg:flex transition-all duration-300" 
      :class="sidebarCollapsed ? 'w-20' : 'w-64'"
      :collapsed="sidebarCollapsed" 
    />

    <div class="flex flex-1 flex-col overflow-hidden">
      <Navbar @toggle-sidebar="handleToggleSidebar" />
      
      <main class="flex-1 overflow-y-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>
