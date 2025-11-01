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

const REGISTER_ACTIVITY_PUSH_TOKEN = gql`
    mutation registerActivityPushToken($activityId: String!, $pushToken: String!, $eventId: String!) {
        registerActivityPushToken(activityId: $activityId, pushToken: $pushToken, eventId: $eventId) {
            success
            message
        }
    }
`

const REGISTER_PUSH_TO_START_TOKEN = gql`
    mutation registerPushToStartToken($pushToStartToken: String!) {
        registerPushToStartToken(pushToStartToken: $pushToStartToken) {
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
    const [registerActivityPushTokenMutation] = useMutation(REGISTER_ACTIVITY_PUSH_TOKEN)
    const [registerPushToStartTokenMutation] = useMutation(REGISTER_PUSH_TO_START_TOKEN)

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

    const registerActivityPushToken = async (event: { activityId: string; pushToken: string; eventId: string }): Promise<boolean> => {
        try {
            const { data } = await registerActivityPushTokenMutation({
                variables: {
                    activityId: event.activityId,
                    pushToken: event.pushToken,
                    eventId: event.eventId,
                },
            })

            return data?.registerActivityPushToken?.success || false
        } catch (error) {
            console.error('Failed to register activity push token:', error)
            return false
        }
    }

    const registerPushToStartToken = async (pushToStartToken: string): Promise<boolean> => {
        try {
            const { data } = await registerPushToStartTokenMutation({
                variables: { pushToStartToken },
            })

            return data?.registerPushToStartToken?.success || false
        } catch (error) {
            console.error('Failed to register push-to-start token:', error)
            return false
        }
    }

    return {
        registerActivity,
        cancelServerActivity,
        completeServerActivity,
        registerActivityPushToken,
        registerPushToStartToken,
    }
}
