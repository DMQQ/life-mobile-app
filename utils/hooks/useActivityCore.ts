import { Platform } from "react-native"
import ExpoLiveActivityModule from "../../modules/expo-live-activity"

export interface ActivityConfig {
    eventId: string
    title: string
    description: string
    endTime: `${number}:${number}:${number}`
    startTime: `${number}:${number}:${number}`
    deepLinkURL?: string
    todos?: Array<{
        id: string
        title: string
        isCompleted: boolean
    }>

    isCompleted?: boolean
}

export const useActivityCore = () => {
    const areActivitiesEnabled = (): boolean => {
        if (Platform.OS !== "ios") return false
        try {
            return ExpoLiveActivityModule.areActivitiesEnabled()
        } catch {
            return false
        }
    }

    const isActivityInProgress = (): boolean => {
        if (Platform.OS !== "ios") return false
        try {
            return ExpoLiveActivityModule.isActivityInProgress()
        } catch {
            return false
        }
    }

    const startCountdownActivity = async (config: ActivityConfig): Promise<string | null> => {
        if (Platform.OS !== "ios") {
            console.warn("Live Activities are only supported on iOS")
            return null
        }

        if (!areActivitiesEnabled()) {
            console.warn("Live Activities are not enabled")
            return null
        }

        try {
            const activityToken = await ExpoLiveActivityModule.startCountdownActivity(
                config.eventId,
                config.deepLinkURL || `lifeapp://activity/${config.eventId}`,
                config.title,
                config.description,
                config.endTime,
                config.startTime,
                config.todos || [],
                config.isCompleted || false,
            )

            return activityToken
        } catch (error) {
            console.error("Failed to start Live Activity:", error)
            return null
        }
    }

    const updateActivityProgress = (progress: number, isCompleted: boolean = false): void => {
        if (Platform.OS !== "ios") return

        try {
            ExpoLiveActivityModule.updateActivity(progress, isCompleted)
        } catch (error) {
            console.error("Failed to update Live Activity:", error)
        }
    }

    const endActivity = (): void => {
        if (Platform.OS !== "ios") return

        try {
            ExpoLiveActivityModule.endActivity()
        } catch (error) {
            console.error("Failed to end Live Activity:", error)
        }
    }

    return {
        areActivitiesEnabled,
        isActivityInProgress,
        startCountdownActivity,
        updateActivityProgress,
        endActivity,
    }
}
