import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const isNavigating = ref(false)

    function startNavigation() {
        isNavigating.value = true
    }

    function endNavigation() {
        // Add a slight delay to ensure the progress bar is seen if the transition is very fast
        setTimeout(() => {
            isNavigating.value = false
        }, 300)
    }

    return {
        isNavigating,
        startNavigation,
        endNavigation
    }
})
