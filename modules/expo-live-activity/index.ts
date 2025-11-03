import { NativeModule, requireNativeModule } from "expo"

export interface ActivityData {
    eventId: string
    deepLinkURL: string
    title: string
    description: string
    endTime: string
    startTime: string
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

export interface ActivityStartedEvent {
    activityId: string
    eventId: string
    pushToken: string
}

export interface PushToStartTokenEvent {
    pushToStartToken: string
}

export type ExpoLiveActivityModuleEvents = {
    onLiveActivityCancel: () => void
    onActivityPushToken: (event: ActivityPushTokenEvent) => void
    onPushToStartToken: (event: PushToStartTokenEvent) => void
    onActivityStartedRemotely: (event: ActivityStartedEvent) => void
    onPushNotificationReceived: (event: PushNotificationEvent) => void
    onTokenReceived: (event: ActivityPushTokenEvent) => void
    onStateChange: (event: { activityID: string; activityName: string; activityState: string }) => void
}

declare class ExpoLiveActivityModule extends NativeModule<ExpoLiveActivityModuleEvents> {
    areActivitiesEnabled(): boolean
    isActivityInProgress(): boolean
    startCountdownActivity(
        eventId: string,
        deepLinkURL: string,
        title: string,
        description: string,
        endTime: string,
        startTime: string,
        todos: Array<{id: string, title: string, isCompleted: boolean}>
    ): Promise<string | null>
    updateActivity(progress: number, isCompleted: boolean): void
    endActivity(): void

    getPushToStartToken(): Promise<string | null>

    saveAppIconToSharedStorage(): void
}

export default requireNativeModule<ExpoLiveActivityModule>("ExpoLiveActivity")
