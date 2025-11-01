import ExpoLiveActivityModule, {
    ActivityPushTokenEvent,
    PushNotificationEvent,
    PushToStartTokenEvent,
} from "../../modules/expo-live-activity"
import { Platform } from "react-native"

export interface ActivityConfig {
    eventId: string
    title: string
    description: string
    endTime: Date
    deepLinkURL?: string
}

export class ActivityManager {
    private static instance: ActivityManager
    private activeActivities: Map<string, string> = new Map()
    private activityPushTokens: Map<string, string> = new Map()
    private pushToStartToken: string | null = null
    private serverHook: any = null
    private pushTokenCallbacks: Array<(event: ActivityPushTokenEvent) => void> = []
    private pushNotificationCallbacks: Array<(event: PushNotificationEvent) => void> = []
    private pushToStartTokenCallbacks: Array<(event: PushToStartTokenEvent) => void> = []

    private constructor() {
        this.setupPushNotificationHandling()
        // Push-to-start monitoring is now handled automatically in Swift OnCreate
    }

    static getInstance(): ActivityManager {
        if (!ActivityManager.instance) {
            ActivityManager.instance = new ActivityManager()
        }
        return ActivityManager.instance
    }

    async startCountdownActivity(config: ActivityConfig): Promise<string | null> {
        console.log("Starting Live Activity with config:", config)

        if (Platform.OS !== "ios") {
            console.warn("Live Activities are only supported on iOS")
            return null
        }

        if (!ExpoLiveActivityModule.areActivitiesEnabled()) {
            console.warn("Live Activities are not enabled")
            return null
        }

        console.log("Live Activities are enabled, starting activity...")

        try {
            const activityToken = await ExpoLiveActivityModule.startCountdownActivity(
                config.eventId,
                config.deepLinkURL || `lifeapp://activity/${config.eventId}`,
                config.title,
                config.description,
                config.endTime,
            )

            console.log("Received activity token:", activityToken)

            if (activityToken) {
                this.activeActivities.set(config.eventId, activityToken)

                if (this.serverHook) {
                    await this.serverHook.registerActivity({
                        eventId: config.eventId,
                        activityToken,
                        endTime: config.endTime.toISOString(),
                    })
                }

                return activityToken
            }

            return null
        } catch (error) {
            console.error("Failed to start Live Activity:", error)
            return null
        }
    }

    updateActivityProgress(eventId: string, progress: number, isCompleted: boolean = false): void {
        if (Platform.OS !== "ios") return

        if (this.activeActivities.has(eventId)) {
            try {
                ExpoLiveActivityModule.updateActivity(progress, isCompleted)
            } catch (error) {
                console.error("Failed to update Live Activity:", error)
            }
        }
    }

    async completeActivity(eventId: string): Promise<void> {
        if (Platform.OS !== "ios") return

        this.updateActivityProgress(eventId, 1.0, true)

        if (this.serverHook) {
            await this.serverHook.completeServerActivity(eventId)
        }

        setTimeout(() => {
            this.cancelActivity(eventId)
        }, 3000)
    }

    async cancelActivity(eventId: string): Promise<void> {
        if (Platform.OS !== "ios") return

        const activityToken = this.activeActivities.get(eventId)
        if (activityToken) {
            try {
                if (this.serverHook) {
                    await this.serverHook.cancelServerActivity(eventId)
                }

                ExpoLiveActivityModule.endActivity()
                this.activeActivities.delete(eventId)
            } catch (error) {
                console.error("Failed to cancel Live Activity:", error)
            }
        }
    }

    cancelAllActivities(): void {
        if (Platform.OS !== "ios") return

        try {
            ExpoLiveActivityModule.endActivity()
            this.activeActivities.clear()
        } catch (error) {
            console.error("Failed to cancel all Live Activities:", error)
        }
    }

    isActivityInProgress(): boolean {
        if (Platform.OS !== "ios") return false
        return ExpoLiveActivityModule.isActivityInProgress()
    }

    getActiveActivities(): string[] {
        return Array.from(this.activeActivities.keys())
    }

    // Push notification methods
    private setupPushNotificationHandling(): void {
        if (Platform.OS !== "ios") return

        try {
            // Listen for push tokens
            ExpoLiveActivityModule.addListener("onActivityPushToken", (event: ActivityPushTokenEvent) => {
                console.log("Activity push token received:", event)
                this.activityPushTokens.set(event.activityId, event.pushToken)

                // Send token to server
                if (this.serverHook) {
                    this.serverHook.registerActivityPushToken(event)
                }

                // Notify callbacks
                this.pushTokenCallbacks.forEach((callback) => callback(event))
            })

            // Listen for push-to-start tokens
            ExpoLiveActivityModule.addListener("onPushToStartToken", (event: PushToStartTokenEvent) => {
                console.log("Push-to-start token received:", event)
                this.pushToStartToken = event.pushToStartToken

                // Send token to server
                if (this.serverHook) {
                    this.serverHook.registerPushToStartToken(event.pushToStartToken)
                }

                // Notify callbacks
                this.pushToStartTokenCallbacks.forEach((callback) => callback(event))
            })
        } catch (error) {
            console.error("Failed to setup push notification handling:", error)
        }
    }

    getActivityPushToken(activityId: string): string | null {
        if (Platform.OS !== "ios") return null
        return this.activityPushTokens.get(activityId) || null
    }

    onActivityPushToken(callback: (event: ActivityPushTokenEvent) => void): void {
        this.pushTokenCallbacks.push(callback)
    }

    onPushNotificationReceived(callback: (event: PushNotificationEvent) => void): void {
        this.pushNotificationCallbacks.push(callback)
    }

    removeActivityPushTokenListener(callback: (event: ActivityPushTokenEvent) => void): void {
        const index = this.pushTokenCallbacks.indexOf(callback)
        if (index > -1) {
            this.pushTokenCallbacks.splice(index, 1)
        }
    }
}

export const activityManager = ActivityManager.getInstance()
