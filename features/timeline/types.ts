import { StackScreenProps } from "@/types"

export type TimelineRootStack = {
    Timeline: undefined
    TimelineDetails: { timelineId: string }
    TimelineDo: { timelineId: string }
    TimelineCreate: {
        selectedDate: string
        mode: "create" | "edit" | "shopping-list"
        timelineId?: string
        todos?: string[]
        title?: string
        description?: string
        beginTime?: string
        endTime?: string
    }
    ImagesPreview: { selectedImage: string; timelineId: string }
    Schedule: { selected: string; selectedDate: string }
    Search: undefined
    CreateTimelineTodos: { timelineId?: string; mode?: "create" | "push-back"; todos: string[] }
    TodosTransferModal: {
        timelineId: string
    }
    CopyTimelineModal: {
        timelineId: string
        timelineTitle: string
        originalDate: string
    }
    MissedEventsModal: {
        eventIds: string[]
    }
}

export type TimelineScreenProps<Key extends keyof TimelineRootStack> = StackScreenProps<TimelineRootStack, Key>
