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

export type ExpoLiveActivityModuleEvents = {
    onLiveActivityCancel: () => void
}

declare class ExpoLiveActivityModule extends NativeModule<ExpoLiveActivityModuleEvents> {
    areActivitiesEnabled(): boolean
    isActivityInProgress(): boolean
    startCountdownActivity(eventId: string, deepLinkURL: string, title: string, description: string, endTime: string): Promise<string | null>
    updateActivity(progress: number, isCompleted: boolean): void
    endActivity(): void
    getActivityToken(): string | null
    cancelActivityById(token: string): void
}

export default requireNativeModule<ExpoLiveActivityModule>("ExpoLiveActivity")
