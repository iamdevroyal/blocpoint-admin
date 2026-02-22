<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AdminLayout from './layouts/AdminLayout.vue'

const route = useRoute()

// Check if we are on a route that requires the admin layout
const isLayoutReady = computed(() => {
  return route.name && route.path !== '/login'
})
</script>

<template>
  <AdminLayout v-if="isLayoutReady">
    <router-view />
  </AdminLayout>
  <!-- Fallback for login or completely unmatched route initialization -->
  <router-view v-else />
</template>
