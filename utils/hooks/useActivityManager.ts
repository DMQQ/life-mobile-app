import { useState, useEffect, useCallback } from "react"
import { useActivityCore, ActivityConfig } from "./useActivityCore"
import { useActivityServer } from "./useActivityServer"
import ExpoLiveActivityModule from "../../modules/expo-live-activity"
import useUser from "./useUser"

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
    const user = useUser()
    const serverHook = useActivityServer()
    const activityCore = useActivityCore()

    useEffect(() => {
        if (!user.isAuthenticated) return

        ExpoLiveActivityModule.getPushToStartToken().then((token) => {
            if (token && serverHook?.registerPushToStartToken) {
                console.log("ExpoLiveActivityModule.getPushToStartToken", { token })

                serverHook.registerPushToStartToken(token)
            }
        })

        const tokenReceivedListener = ExpoLiveActivityModule.addListener("onTokenReceived", (event) => {
            const tokenKey = `${event.activityID}-${event.activityPushToken}`

            console.log("Token received for activity:", event)

            if (processedTokens.has(tokenKey)) return

            setProcessedTokens((prev) => new Set(prev).add(tokenKey))

            if (serverHook?.setLiveActivityUpdateToken && event.activityPushToken) {
                const timelineId = event.activityName
                serverHook.setLiveActivityUpdateToken(event.activityID, event.activityPushToken, timelineId)
            }
        })

        const stateChangeListener = ExpoLiveActivityModule.addListener("onStateChange", (event) => {
            console.log("Activity state changed:", event)

            if (event.activityState === "ended" || event.activityState === "dismissed") {
                setActiveActivities((prev) => prev.filter((id) => id !== event.eventId))
                setIsInProgress(activityCore.isActivityInProgress())
            }

            console.log(
                "Activity state update - ID:",
                event.activityID,
                "EventID:",
                event.eventId,
                "State:",
                event.activityState,
            )
        })

        ExpoLiveActivityModule.saveAppIconToSharedStorage()

        return () => {
            tokenReceivedListener.remove()
            stateChangeListener.remove()
        }
    }, [user.isAuthenticated])

    useEffect(() => {
        const syncActivitiesWithBackend = async () => {
            try {
                const activities = await ExpoLiveActivityModule.getActivityTokens()

                if (serverHook && Object.keys(activities).length > 0) {
                    for (const [activityID, activityData] of Object.entries(activities)) {
                        if (activityData.pushToken && serverHook.setLiveActivityUpdateToken) {
                            serverHook.setLiveActivityUpdateToken(
                                activityID,
                                activityData.pushToken,
                                activityData.eventId,
                            )
                        }

                        console.log(`Activity ${activityID} (${activityData.eventId}): ${activityData.state}`)
                    }
                }
            } catch (error) {
                console.error("Error syncing activities with backend:", error)
            }
        }

        syncActivitiesWithBackend()
    }, [activeActivities])

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

export interface UseActivityUtilsReturn {
    getActivities: () => Promise<Record<string, any>>
    isActivityPending: (eventId: string) => Promise<boolean>
    startActivity: (config: ActivityConfig) => Promise<string | null>
    isSupported: boolean

    isPending: boolean
}

export const useActivityUtils = (eventId: string): UseActivityUtilsReturn => {
    const activityCore = useActivityCore()

    const [isPending, setIsPending] = useState(false)

    const getActivities = useCallback(async () => {
        try {
            return await ExpoLiveActivityModule.getActivityTokens()
        } catch (error) {
            console.error("Error getting activities:", error)
            return {}
        }
    }, [])

    const isActivityPending = useCallback(async (eventId: string) => {
        try {
            const activities = await ExpoLiveActivityModule.getActivityTokens()

            for (const [_, activityData] of Object.entries(activities)) {
                if (
                    activityData.eventId === eventId &&
                    (activityData.state === "active" || activityData.state === "pending")
                ) {
                    return true
                }
            }
            return false
        } catch (error) {
            console.error("Error checking activity status:", error)
            return false
        }
    }, [])

    useEffect(() => {
        isActivityPending(eventId).then(setIsPending)
    }, [eventId])

    useEffect(() => {
        const stateChangeListener = ExpoLiveActivityModule.addListener("onStateChange", (event) => {
            // Update isPending state if this event matches our eventId
            if (event.eventId === eventId) {
                const isActive = event.activityState === "active" || event.activityState === "pending"
                setIsPending(isActive)
            }
        })

        return () => {
            stateChangeListener.remove()
        }
    }, [eventId])

    const startActivity = useCallback(
        async (config: ActivityConfig): Promise<string | null> => {
            try {
                const id = await activityCore.startCountdownActivity(config)

                setIsPending(typeof id === "string")

                return id
            } catch (error) {
                console.error("Error starting activity:", error)
                return null
            }
        },
        [activityCore],
    )

    return {
        getActivities,
        isActivityPending,
        startActivity,
        isSupported: activityCore.areActivitiesEnabled(),

        isPending,
    }
}
