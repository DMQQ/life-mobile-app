import { gql, useMutation } from "@apollo/client"
import * as Notifications from "expo-notifications"
import { NOTIFICATIONS_QUERY } from "../components/Wallet/WalletNotifications"

export default function useReadAllNotifications() {
    const [readAll] = useMutation(
        gql`
            mutation ReadAllNotifications {
                readAllNotifications
            }
        `,
        {
            refetchQueries: [
                {
                    query: NOTIFICATIONS_QUERY,
                    variables: { take: 25, skip: 0 },
                },
            ],
        },
    )

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
