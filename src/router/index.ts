import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/login', name: 'login', component: () => import('../views/auth/Login.vue'), meta: { requiresAuth: false } },
        { path: '/', name: 'home', redirect: '/dashboard' },
        { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },

        // Core Domain Pages
        { path: '/agents', name: 'agents', component: () => import('../views/agents/AgentList.vue'), meta: { requiresAuth: true } },
        { path: '/agents/:id', name: 'agent details', component: () => import('../views/agents/AgentDetail.vue'), meta: { requiresAuth: true } },
        { path: '/transactions', name: 'transactions', component: () => import('../views/transactions/Transactions.vue'), meta: { requiresAuth: true } },
        { path: '/ledger', name: 'ledger', component: () => import('../views/ledger/Ledger.vue'), meta: { requiresAuth: true } },
        { path: '/compliance', name: 'compliance', component: () => import('../views/compliance/Compliance.vue'), meta: { requiresAuth: true } },

        // Placeholder Pages for pending modules
        { path: '/wallets', name: 'wallets', component: () => import('../views/wallets/Wallets.vue'), meta: { requiresAuth: true } },
        { path: '/giftcards', name: 'giftcards', component: () => import('../views/giftcards/GiftCards.vue'), meta: { requiresAuth: true } },
        { path: '/stablecoins', name: 'stablecoins', component: () => import('../views/stablecoins/Stablecoins.vue'), meta: { requiresAuth: true } },
        { path: '/treasury', name: 'treasury', component: () => import('../views/treasury/Treasury.vue'), meta: { requiresAuth: true } },
        { path: '/system/pricing', name: 'pricing configuration', component: () => import('../views/system/PricingConfig.vue'), meta: { requiresAuth: true } },
        { path: '/system/commissions', name: 'commissions configuration', component: () => import('../views/system/PricingConfig.vue'), meta: { requiresAuth: true } },
        { path: '/audit-logs', name: 'audit logs', component: () => import('../views/system/AuditLogs.vue'), meta: { requiresAuth: true } },
        { path: '/reconciliation', name: 'reconciliation', component: () => import('../views/ledger/Reconciliation.vue'), meta: { requiresAuth: true } },
        { path: '/alerts', name: 'risk alerts', component: () => import('../views/compliance/RiskAlerts.vue'), meta: { requiresAuth: true } },
        { path: '/notifications', name: 'notifications', component: () => import('../views/system/Notifications.vue'), meta: { requiresAuth: true } },
        { path: '/profile', name: 'admin profile', component: () => import('../views/system/Profile.vue'), meta: { requiresAuth: true } },
        { path: '/system/settings', name: 'system settings', component: () => import('../views/system/SystemSettings.vue'), meta: { requiresAuth: true } },
    ]
})

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login' })
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router
