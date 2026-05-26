import { graphql } from "@/gql/gql"
import { useMutation, useQuery } from "@apollo/client"
import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"
import Feedback from "react-native-haptic-feedback"

export interface Notification {
    id: string
    message: {
        title: string
        body: string
        type: string
        data: {
            [key: string]: any
        }
    }
    sendAt: string
    read: boolean
}

export const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
}

export const NOTIFICATIONS_QUERY = graphql(`
    query WalletNotifications($skip: Int!, $take: Int!) {
        notifications(skip: $skip, take: $take) {
            id
            message
            sendAt
            read
        }
    }
`)

export function useGetNotifications() {
    const [unreadCount, setUnreadCount] = useState(0)

    const notification = useQuery(NOTIFICATIONS_QUERY, {
        variables: { take: 25, skip: 0 },
    })

    useEffect(() => {
        if (notification.data?.notifications) {
            const unreadNotifications = notification.data.notifications.filter((n: Notification) => !n.read)
            setUnreadCount(unreadNotifications.length)
            Notifications.setBadgeCountAsync(unreadNotifications.length)
        } else {
            setUnreadCount(0)
        }
    }, [notification.data])

    return { ...notification, unreadCount }
}

export function useReadNotification(notification: Notification, onDismiss: (id: string) => any) {
    const [readNotification] = useMutation(
        graphql(`
            mutation ReadNotification($id: ID!) {
                readNotification(id: $id)
            }
        `),
        {
            variables: { id: notification.id },
            awaitRefetchQueries: true,
            refetchQueries: [
                {
                    query: NOTIFICATIONS_QUERY,
                    variables: { take: 25, skip: 0 },
                },
            ],
        },
    )

    const handleDismiss = () => {
        Feedback.trigger("impactLight")
        onDismiss(notification.id)
    }

    const handlePress = async () => {
        Feedback.trigger("selection")

        await readNotification().catch((error) => {
            console.error("Error marking notification as read:", error)
        })
    }

    return { handleDismiss, handlePress }
}
