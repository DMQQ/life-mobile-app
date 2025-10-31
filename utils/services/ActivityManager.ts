import ExpoLiveActivityModule from "../../modules/expo-live-activity"
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
    private serverHook: any = null

    private constructor() {}

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

}

export const activityManager = ActivityManager.getInstance()