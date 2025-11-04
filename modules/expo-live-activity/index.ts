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
    activityID: string
    activityPushToken: string
    eventId: string
}

export interface TokenReceivedEvent {
    activityID: string
    activityPushToken: string
    activityName: string
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
    activityPushToStartToken: string
}

export interface StateChangeEvent {
    activityID: string
    activityState: string
    eventId: string
}

export type ExpoLiveActivityModuleEvents = {
    onLiveActivityCancel: () => void
    onActivityPushToken: (event: ActivityPushTokenEvent) => void
    onPushToStartToken: (event: PushToStartTokenEvent) => void
    onActivityStartedRemotely: (event: ActivityStartedEvent) => void
    onPushNotificationReceived: (event: PushNotificationEvent) => void
    onTokenReceived: (event: TokenReceivedEvent) => void
    onStateChange: (event: StateChangeEvent) => void
}

export interface LiveActivityEvent {
    activityID: string
    activityPushToken: string
    activityName: string
    eventId: string
    state: string
    pushToken?: string
    other: Record<string, any> | null | undefined
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
        todos: Array<{ id: string; title: string; isCompleted: boolean }>,
        isCompleted: boolean,
    ): Promise<string | null>
    updateActivity(progress: number, isCompleted: boolean): void
    endActivity(): void

    getPushToStartToken(): Promise<string | null>

    saveAppIconToSharedStorage(): void

    getActivityTokens(): Promise<Record<string, LiveActivityEvent>>
}

export default requireNativeModule<ExpoLiveActivityModule>("ExpoLiveActivity")
