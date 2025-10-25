import { Timeline, CopyTimelineVariables } from "@/types"
import { useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"
import { COPY_TIMELINE } from "../schemas/schemas"

import { Platform, ToastAndroid } from "react-native"

import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import moment from "moment"
import { GET_MONTHLY_EVENTS } from "../general/useTimeline"

export default function useCopyTimeline() {
    const navigation = useNavigation<any>()

    const [copyTimelineMutation, state] = useMutation(COPY_TIMELINE, {})

    const copyTimeline = async ({ timelineId, newDate }: CopyTimelineVariables) => {
        try {
            const { data } = await copyTimelineMutation({
                variables: {
                    timelineId,
                    newDate,
                },

                refetchQueries: [
                    {
                        query: GET_MONTHLY_EVENTS,
                        variables: {
                            date: moment().format("YYYY-MM-DD"),
                        },
                    },
                    {
                        query: GET_MAIN_SCREEN,
                        variables: getMainScreenBaseVariables(),
                    },
                ],

                update(cache, { data: { copyTimeline } }) {
                    // Update cache for the target date
                    const targetDate = newDate || copyTimeline.date

                    try {
                        const existingData = cache.readQuery({
                            query: GET_TIMELINE_QUERY,
                            variables: { date: targetDate },
                        }) as { timeline: Timeline[] } | null

                        if (existingData) {
                            cache.writeQuery({
                                query: GET_TIMELINE_QUERY,
                                variables: { date: targetDate },
                                data: {
                                    timeline: [copyTimeline, ...existingData.timeline],
                                },
                                overwrite: true,
                            })
                        }
                    } catch (e) {
                        // Cache miss is okay, the refetchQueries will handle it
                        console.log("Cache miss for timeline query, refetch will handle it")
                    }
                },

                onError: (err) => {
                    console.error("Copy timeline error:", err)
                    Platform.OS === "android" && ToastAndroid.show("Could not copy timeline", ToastAndroid.LONG)
                },
            })

            return data?.copyTimeline
        } catch (error) {
            console.error("Failed to copy timeline:", error)
            throw error
        }
    }

    return {
        copyTimeline,
        loading: state.loading,
        error: state.error,
    }
}
