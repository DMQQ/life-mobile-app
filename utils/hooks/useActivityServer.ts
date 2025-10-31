import { useMutation, gql } from "@apollo/client"

const CREATE_ACTIVITY = gql`
    mutation createActivity($eventId: String!, $activityToken: String!, $endTime: String!) {
        createActivity(eventId: $eventId, activityToken: $activityToken, endTime: $endTime) {
            success
            message
        }
    }
`

const CANCEL_ACTIVITY = gql`
    mutation cancelActivity($eventId: String!) {
        cancelActivity(eventId: $eventId) {
            success
            message
        }
    }
`

const COMPLETE_ACTIVITY = gql`
    mutation completeActivity($eventId: String!) {
        completeActivity(eventId: $eventId) {
            success
            message
        }
    }
`

export interface ActivityServerConfig {
    eventId: string
    activityToken: string
    endTime: string
}

export const useActivityServer = () => {
    const [createActivityMutation] = useMutation(CREATE_ACTIVITY)
    const [cancelActivityMutation] = useMutation(CANCEL_ACTIVITY)
    const [completeActivityMutation] = useMutation(COMPLETE_ACTIVITY)

    const registerActivity = async (config: ActivityServerConfig): Promise<boolean> => {
        try {
            const { data } = await createActivityMutation({
                variables: {
                    eventId: config.eventId,
                    activityToken: config.activityToken,
                    endTime: config.endTime,
                },
            })

            return data?.createActivity?.success || false
        } catch (error) {
            // console.error('Failed to register activity with server:', error)
            return false
        }
    }

    const cancelServerActivity = async (eventId: string): Promise<boolean> => {
        try {
            const { data } = await cancelActivityMutation({
                variables: { eventId },
            })

            return data?.cancelActivity?.success || false
        } catch (error) {
            console.error("Failed to cancel activity on server:", error)
            return false
        }
    }

    const completeServerActivity = async (eventId: string): Promise<boolean> => {
        try {
            const { data } = await completeActivityMutation({
                variables: { eventId },
            })

            return data?.completeActivity?.success || false
        } catch (error) {
            console.error("Failed to complete activity on server:", error)
            return false
        }
    }

    return {
        registerActivity,
        cancelServerActivity,
        completeServerActivity,
    }
}
