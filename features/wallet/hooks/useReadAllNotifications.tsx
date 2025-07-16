import { gql, useMutation } from "@apollo/client"
import * as Notifications from "expo-notifications"

export default function useReadAllNotifications() {
    const [readAll] = useMutation(gql`
        mutation ReadAllNotifications {
            readAllNotifications
        }
    `)

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
