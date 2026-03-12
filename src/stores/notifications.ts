import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
    id: number
    type: 'critical' | 'warning' | 'info' | 'success'
    title: string
    message: string
    time: string
    date: string
    read: boolean
    source: string
    metadata?: Record<string, any>
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([
        {
            id: 1,
            type: 'critical',
            title: 'AML Alert: High Volume Transfer',
            message: 'Wallet UUID 550e...-440000 detected a transfer of ₦15,000,000.00 exceeding risk threshold.',
            time: '2 mins ago',
            date: '2024-02-22 10:45',
            read: false,
            source: 'Risk Engine',
            metadata: {
                wallet_id: '550e8400-e29b-41d4-a716-446655440000',
                amount: 15000000,
                rule_triggered: 'HIGH_VOLUME_P2P'
            }
        },
        {
            id: 2,
            type: 'info',
            title: 'New Agent Tier 3 Registration',
            message: 'Sarah Ahmed has applied for Tier 3 agent status. Documentation is ready for review.',
            time: '15 mins ago',
            date: '2024-02-22 10:32',
            read: false,
            source: 'Onboarding'
        },
        {
            id: 3,
            type: 'success',
            title: 'Inter-vault Settlement Completed',
            message: 'Weekly settlement between Operational Vault and Settlement Reserve was successful.',
            time: '1h ago',
            date: '2024-02-22 09:15',
            read: true,
            source: 'Treasury'
        },
        {
            id: 4,
            type: 'warning',
            title: 'Low Liquidity Notice: NGN/USDT',
            message: 'Stablecoin liquidity provider pool (YellowCard) is approaching its lower bound margin.',
            time: '3h ago',
            date: '2024-02-22 07:45',
            read: true,
            source: 'Liquidity'
        },
        {
            id: 5,
            type: 'info',
            title: 'System Patch Deployed: v2.4.1',
            message: 'Global pricing engine routes updated. Latency optimized across all network nodes.',
            time: '5h ago',
            date: '2024-02-22 05:12',
            read: true,
            source: 'Core DevOps'
        }
    ])

    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
    const recentNotifications = computed(() => notifications.value.slice(0, 5))

    function markAsRead(id: number) {
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
            notification.read = true
        }
    }

    function markAllRead() {
        notifications.value.forEach(n => n.read = true)
    }

    function deleteNotification(id: number) {
        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    function getNotificationById(id: number) {
        return notifications.value.find(n => n.id === id)
    }

    return {
        notifications,
        unreadCount,
        recentNotifications,
        markAsRead,
        markAllRead,
        deleteNotification,
        getNotificationById
    }
})
