import ExpoLiveActivityModule, { ActivityPushTokenEvent, PushNotificationEvent, PushToStartTokenEvent } from "../../modules/expo-live-activity"
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
        this.enablePushToStart()
        this.handleAppLaunchFromPushToStart()
    }

    static getInstance(): ActivityManager {
        if (!ActivityManager.instance) {
            ActivityManager.instance = new ActivityManager()
        }
        return ActivityManager.instance
    }

    setServerHook(serverHook: any): void {
        this.serverHook = serverHook
    }

    async startCountdownActivity(config: ActivityConfig): Promise<string | null> {
        console.log('Starting Live Activity with config:', config)
        
        if (Platform.OS !== 'ios') {
            console.warn('Live Activities are only supported on iOS')
            return null
        }

        if (!ExpoLiveActivityModule.areActivitiesEnabled()) {
            console.warn('Live Activities are not enabled')
            return null
        }

        console.log('Live Activities are enabled, starting activity...')

        try {
            const activityToken = await ExpoLiveActivityModule.startCountdownActivity(
                config.eventId,
                config.deepLinkURL || `lifeapp://activity/${config.eventId}`,
                config.title,
                config.description,
                config.endTime.toISOString()
            )
            
            console.log('Received activity token:', activityToken)
            
            if (activityToken) {
                this.activeActivities.set(config.eventId, activityToken)
                
                if (this.serverHook) {
                    await this.serverHook.registerActivity({
                        eventId: config.eventId,
                        activityToken,
                        endTime: config.endTime.toISOString()
                    })
                }
                
                return activityToken
            }
            
            return null
        } catch (error) {
            console.error('Failed to start Live Activity:', error)
            return null
        }
    }

    updateActivityProgress(eventId: string, progress: number, isCompleted: boolean = false): void {
        if (Platform.OS !== 'ios') return

        if (this.activeActivities.has(eventId)) {
            try {
                ExpoLiveActivityModule.updateActivity(progress, isCompleted)
            } catch (error) {
                console.error('Failed to update Live Activity:', error)
            }
        }
    }

    async completeActivity(eventId: string): Promise<void> {
        if (Platform.OS !== 'ios') return

        this.updateActivityProgress(eventId, 1.0, true)
        
        if (this.serverHook) {
            await this.serverHook.completeServerActivity(eventId)
        }
        
        setTimeout(() => {
            this.cancelActivity(eventId)
        }, 3000)
    }

    async cancelActivity(eventId: string): Promise<void> {
        if (Platform.OS !== 'ios') return

        const activityToken = this.activeActivities.get(eventId)
        if (activityToken) {
            try {
                if (this.serverHook) {
                    await this.serverHook.cancelServerActivity(eventId)
                }
                
                ExpoLiveActivityModule.cancelActivityById(activityToken)
                this.activeActivities.delete(eventId)
            } catch (error) {
                console.error('Failed to cancel Live Activity:', error)
            }
        }
    }

    cancelAllActivities(): void {
        if (Platform.OS !== 'ios') return

        try {
            ExpoLiveActivityModule.endActivity()
            this.activeActivities.clear()
        } catch (error) {
            console.error('Failed to cancel all Live Activities:', error)
        }
    }

    isActivityInProgress(): boolean {
        if (Platform.OS !== 'ios') return false
        return ExpoLiveActivityModule.isActivityInProgress()
    }

    getActiveActivities(): string[] {
        return Array.from(this.activeActivities.keys())
    }

    // Push notification methods
    private setupPushNotificationHandling(): void {
        if (Platform.OS !== 'ios') return

        try {
            ExpoLiveActivityModule.setupPushNotificationHandling()

            // Listen for push tokens
            ExpoLiveActivityModule.addListener('onActivityPushToken', (event: ActivityPushTokenEvent) => {
                console.log('Activity push token received:', event)
                this.activityPushTokens.set(event.activityId, event.pushToken)
                
                // Send token to server
                if (this.serverHook) {
                    this.serverHook.registerActivityPushToken(event)
                }

                // Notify callbacks
                this.pushTokenCallbacks.forEach(callback => callback(event))
            })

            // Listen for push notifications
            ExpoLiveActivityModule.addListener('onPushNotificationReceived', (event: PushNotificationEvent) => {
                console.log('Push notification received for Live Activity:', event)
                this.pushNotificationCallbacks.forEach(callback => callback(event))
            })

            // Listen for push-to-start tokens
            ExpoLiveActivityModule.addListener('onPushToStartToken', (event: PushToStartTokenEvent) => {
                console.log('Push-to-start token received:', event)
                this.pushToStartToken = event.pushToStartToken
                
                // Send token to server
                if (this.serverHook) {
                    this.serverHook.registerPushToStartToken(event.pushToStartToken)
                }

                // Notify callbacks
                this.pushToStartTokenCallbacks.forEach(callback => callback(event))
            })
        } catch (error) {
            console.error('Failed to setup push notification handling:', error)
        }
    }

    private enablePushToStart(): void {
        if (Platform.OS !== 'ios') return

        try {
            ExpoLiveActivityModule.enablePushToStart()
            console.log('Push-to-start enabled')
        } catch (error) {
            console.error('Failed to enable push-to-start:', error)
        }
    }

    private async handleAppLaunchFromPushToStart(): Promise<void> {
        if (Platform.OS !== 'ios') return

        try {
            const activityId = await ExpoLiveActivityModule.handleAppLaunchFromPushToStart()
            if (activityId) {
                console.log('App launched from push-to-start notification with activity:', activityId)
                // Activity is already being monitored by the native module
            }
        } catch (error) {
            console.error('Failed to handle app launch from push-to-start:', error)
        }
    }

    async startActivityFromPushNotification(userInfo: Record<string, any>): Promise<string | null> {
        if (Platform.OS !== 'ios') return null

        try {
            const activityId = await ExpoLiveActivityModule.startActivityFromPushNotification(userInfo)
            console.log('Activity started from push notification:', activityId)
            return activityId
        } catch (error) {
            console.error('Failed to start activity from push notification:', error)
            return null
        }
    }

    getActivityPushToken(activityId: string): string | null {
        if (Platform.OS !== 'ios') return null
        return this.activityPushTokens.get(activityId) || ExpoLiveActivityModule.getActivityPushToken(activityId)
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

    removePushNotificationListener(callback: (event: PushNotificationEvent) => void): void {
        const index = this.pushNotificationCallbacks.indexOf(callback)
        if (index > -1) {
            this.pushNotificationCallbacks.splice(index, 1)
        }
    }

    // Push-to-start methods
    getPushToStartToken(): string | null {
        if (Platform.OS !== 'ios') return null
        return this.pushToStartToken || ExpoLiveActivityModule.getPushToStartToken()
    }

    onPushToStartToken(callback: (event: PushToStartTokenEvent) => void): void {
        this.pushToStartTokenCallbacks.push(callback)
    }

    removePushToStartTokenListener(callback: (event: PushToStartTokenEvent) => void): void {
        const index = this.pushToStartTokenCallbacks.indexOf(callback)
        if (index > -1) {
            this.pushToStartTokenCallbacks.splice(index, 1)
        }
    }

}

export const activityManager = ActivityManager.getInstance()