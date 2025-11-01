import { NativeModule, requireNativeModule } from "expo"

export interface ActivityData {
    eventId: string
    deepLinkURL: string
    title: string
    description: string
    endTime: string
}

export interface ActivityContentState {
    title: string
    description: string
    startTime: string
    endTime: string
    isCompleted: boolean
    progress: number
}

export interface ActivityPushTokenEvent {
    activityId: string
    pushToken: string
    eventId: string
}

export interface PushNotificationEvent {
    userInfo: Record<string, any>
    activityId: string
}

export interface PushToStartTokenEvent {
    pushToStartToken: string
}

export type ExpoLiveActivityModuleEvents = {
    onLiveActivityCancel: () => void
    onActivityPushToken: (event: ActivityPushTokenEvent) => void
    onPushNotificationReceived: (event: PushNotificationEvent) => void
    onPushToStartToken: (event: PushToStartTokenEvent) => void
}

declare class ExpoLiveActivityModule extends NativeModule<ExpoLiveActivityModuleEvents> {
    areActivitiesEnabled(): boolean
    isActivityInProgress(): boolean
    startCountdownActivity(eventId: string, deepLinkURL: string, title: string, description: string, endTime: string): Promise<string | null>
    updateActivity(progress: number, isCompleted: boolean): void
    endActivity(): void
    getActivityToken(): string | null
    getActivityPushToken(activityId: string): string | null
    startActivityFromPushNotification(userInfo: Record<string, any>): Promise<string | null>
    setupPushNotificationHandling(): void
    enablePushToStart(): void
    getPushToStartToken(): string | null
    handleAppLaunchFromPushToStart(): Promise<string | null>
    cancelActivityById(token: string): void
}

export default requireNativeModule<ExpoLiveActivityModule>("ExpoLiveActivity")
