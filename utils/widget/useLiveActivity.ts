import { useEffect } from "react"
import * as ExpoLiveActivity from "@/modules/expo-live-activity"

export default function useLiveActivity() {
    useEffect(() => {
        ExpoLiveActivity.addActivityPushToStartTokenListener((event) => {
            const { activityPushToStartToken } = event
            // Send this token to your server
            console.log("Push-to-start token:", activityPushToStartToken)
        })
    }, [])
}
