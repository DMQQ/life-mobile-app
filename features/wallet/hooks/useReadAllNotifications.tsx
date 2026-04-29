import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"
import * as Notifications from "expo-notifications"
import { NOTIFICATIONS_QUERY } from "../components/Wallet/WalletNotifications"

const READ_ALL_NOTIFICATIONS = graphql(`
    mutation ReadAllNotifications {
        readAllNotifications
    }
`)

export default function useReadAllNotifications() {
    const [readAll] = useMutation(READ_ALL_NOTIFICATIONS, {
        refetchQueries: [
            {
                query: NOTIFICATIONS_QUERY,
                variables: { take: 25, skip: 0 },
            },
        ],
    })

    const readAllNotifications = async () => {
        try {
            await readAll()
            Notifications.setBadgeCountAsync(0)
        } catch (error) {
            console.error("Error reading all notifications:", error)
        }
    }

    return { readAllNotifications }
}
