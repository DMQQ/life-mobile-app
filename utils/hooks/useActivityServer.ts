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

const SET_PUSH_TO_START_TOKEN = gql`
    mutation setPushToStartToken($pushToStartToken: String!) {
        setPushToStartToken(pushToStartToken: $pushToStartToken)
    }
`

const SET_LIVE_ACTIVITY_UPDATE_TOKEN = gql`
    mutation setLiveActivityUpdateToken($input: SetUpdateTokenInput!) {
        setLiveActivityUpdateToken(input: $input)
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
    const [setPushToStartTokenMutation] = useMutation(SET_PUSH_TO_START_TOKEN)
    const [setLiveActivityUpdateTokenMutation] = useMutation(SET_LIVE_ACTIVITY_UPDATE_TOKEN)

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

    const registerPushToStartToken = async (pushToStartToken: string): Promise<boolean> => {
        try {
            const { data } = await setPushToStartTokenMutation({
                variables: { pushToStartToken },
            })

            return data?.setPushToStartToken || false
        } catch (error) {
            console.error("Failed to register push-to-start token:", error)
            return false
        }
    }

    const setLiveActivityUpdateToken = async (activityId: string, updateToken: string, timelineId?: string): Promise<boolean> => {
        try {
            const { data } = await setLiveActivityUpdateTokenMutation({
                variables: {
                    input: {
                        activityId,
                        updateToken,
                        timelineId, // Send the timeline ID if available
                    },
                },
            })

            return data?.setLiveActivityUpdateToken === true
        } catch (error: any) {
            console.error("Failed to set Live Activity update token:", error.message)
            return false
        }
    }

    return {
        registerActivity,
        cancelServerActivity,
        completeServerActivity,
        registerPushToStartToken,
        setLiveActivityUpdateToken,
    }
}
