import { useState, useEffect, useCallback } from "react"
import { useActivityCore, ActivityConfig } from "./useActivityCore"
import { useActivityServer } from "./useActivityServer"
import ExpoLiveActivityModule from "../../modules/expo-live-activity"

export interface UseActivityManagerReturn {
    isSupported: boolean
    isInProgress: boolean
    activeActivities: string[]
    startActivity: (config: ActivityConfig) => Promise<string | null>
    updateActivity: (eventId: string, progress: number, isCompleted?: boolean) => void
    completeActivity: (eventId: string) => void
    cancelActivity: (eventId: string) => void
    cancelAllActivities: () => void
}

export const useActivityManager = (): UseActivityManagerReturn => {
    const [isSupported, setIsSupported] = useState(false)
    const [isInProgress, setIsInProgress] = useState(false)
    const [activeActivities, setActiveActivities] = useState<string[]>([])
    const [processedTokens, setProcessedTokens] = useState<Set<string>>(new Set())

    const serverHook = useActivityServer()
    const activityCore = useActivityCore()

    useEffect(() => {
        ExpoLiveActivityModule.getPushToStartToken().then((token) => {
            if (token && serverHook?.registerPushToStartToken) {
                console.log("ExpoLiveActivityModule.getPushToStartToken", { token })

                serverHook.registerPushToStartToken(token)
            }
        })

        const tokenReceivedListener = ExpoLiveActivityModule.addListener("onTokenReceived", (event: any) => {
            const tokenKey = `${event.activityID}-${event.activityPushToken}`

            console.log("Token received for activity:", event)

            if (processedTokens.has(tokenKey)) return

            setProcessedTokens((prev) => new Set(prev).add(tokenKey))

            if (serverHook?.setLiveActivityUpdateToken && event.activityPushToken) {
                // Use activityName as timelineId - this is the eventId from Live Activity attributes
                const timelineId = event.activityName || event.eventId
                serverHook.setLiveActivityUpdateToken(event.activityID, event.activityPushToken, timelineId)
            }
        })

        ExpoLiveActivityModule.saveAppIconToSharedStorage()

        return () => {
            tokenReceivedListener.remove()
        }
    }, [])

    useEffect(() => {
        setIsSupported(activityCore.areActivitiesEnabled())
    }, [])

    useEffect(() => {
        const updateStatus = () => {
            setIsInProgress(activityCore.isActivityInProgress())
        }

        updateStatus()
        const interval = setInterval(updateStatus, 5000)

        return () => clearInterval(interval)
    }, [])

    const startActivity = useCallback(
        async (config: ActivityConfig): Promise<string | null> => {
            try {
                const result = await activityCore.startCountdownActivity(config)
                if (result) {
                    setActiveActivities((prev) => [...prev, config.eventId])
                    setIsInProgress(true)
                }
                return result
            } catch (error) {
                console.error("Error starting activity:", error)
                return null
            }
        },
        [activityCore],
    )

    const updateActivity = useCallback(
        (_eventId: string, progress: number, isCompleted: boolean = false) => {
            try {
                activityCore.updateActivityProgress(progress, isCompleted)
            } catch (error) {
                console.error("Error updating activity:", error)
            }
        },
        [activityCore],
    )

    const completeActivity = useCallback(
        async (eventId: string) => {
            try {
                activityCore.updateActivityProgress(1.0, true)
                setTimeout(() => {
                    activityCore.endActivity()
                    setActiveActivities((prev) => prev.filter((id) => id !== eventId))
                    setIsInProgress(activityCore.isActivityInProgress())
                }, 3000)
            } catch (error) {
                console.error("Error completing activity:", error)
            }
        },
        [activityCore],
    )

    const cancelActivity = useCallback(
        async (eventId: string) => {
            try {
                activityCore.endActivity()
                setActiveActivities((prev) => prev.filter((id) => id !== eventId))
                setIsInProgress(false)
            } catch (error) {
                console.error("Error cancelling activity:", error)
            }
        },
        [activityCore],
    )

    const cancelAllActivities = useCallback(() => {
        try {
            activityCore.endActivity()
            setActiveActivities([])
            setIsInProgress(false)
        } catch (error) {
            console.error("Error cancelling all activities:", error)
        }
    }, [activityCore])

    return {
        isSupported,
        isInProgress,
        activeActivities,
        startActivity,
        updateActivity,
        completeActivity,
        cancelActivity,
        cancelAllActivities,
    }
}
