import { useState, useEffect, useCallback } from "react"
import { activityManager, ActivityConfig } from "../services/ActivityManager"
import { useActivityServer } from "./useActivityServer"
import ExpoLiveActivityModule, { ActivityPushTokenEvent, PushToStartTokenEvent } from "../../modules/expo-live-activity"
import * as Notifications from "expo-notifications"

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

    const serverHook = useActivityServer()

    useEffect(() => {
        ExpoLiveActivityModule.getPushToStartToken().then((token) => {
            if (token && serverHook?.registerPushToStartToken) {
                console.log("ExpoLiveActivityModule.getPushToStartToken", { token })

                serverHook.registerPushToStartToken(token)
            }
        })

        console.log("is pending ", ExpoLiveActivityModule.isActivityInProgress())
    }, [])

    useEffect(() => {
        try {
            const supported = ExpoLiveActivityModule.areActivitiesEnabled()
            setIsSupported(supported)
        } catch (error) {
            console.warn("Error checking Live Activities support:", error)
            setIsSupported(false)
        }
    }, [])

    useEffect(() => {
        const updateStatus = () => {
            try {
                setIsInProgress(activityManager.isActivityInProgress())
                setActiveActivities(activityManager.getActiveActivities())
            } catch (error) {
                console.warn("Error updating activity status:", error)
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 5000)

        return () => clearInterval(interval)
    }, [])

    const startActivity = useCallback(async (config: ActivityConfig): Promise<string | null> => {
        try {
            const result = await activityManager.startCountdownActivity(config)
            setActiveActivities(activityManager.getActiveActivities())
            setIsInProgress(activityManager.isActivityInProgress())
            return result
        } catch (error) {
            console.error("Error starting activity:", error)
            return null
        }
    }, [])

    const updateActivity = useCallback((eventId: string, progress: number, isCompleted: boolean = false) => {
        try {
            activityManager.updateActivityProgress(eventId, progress, isCompleted)
        } catch (error) {
            console.error("Error updating activity:", error)
        }
    }, [])

    const completeActivity = useCallback(async (eventId: string) => {
        try {
            await activityManager.completeActivity(eventId)
            setTimeout(() => {
                setActiveActivities(activityManager.getActiveActivities())
                setIsInProgress(activityManager.isActivityInProgress())
            }, 100)
        } catch (error) {
            console.error("Error completing activity:", error)
        }
    }, [])

    const cancelActivity = useCallback(async (eventId: string) => {
        try {
            await activityManager.cancelActivity(eventId)
            setActiveActivities(activityManager.getActiveActivities())
            setIsInProgress(activityManager.isActivityInProgress())
        } catch (error) {
            console.error("Error cancelling activity:", error)
        }
    }, [])

    const cancelAllActivities = useCallback(() => {
        try {
            activityManager.cancelAllActivities()
            setActiveActivities([])
            setIsInProgress(false)
        } catch (error) {
            console.error("Error cancelling all activities:", error)
        }
    }, [])

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
