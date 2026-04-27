import { useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { Platform, ToastAndroid } from "react-native"
import moment from "moment"

import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"
import { COPY_OCCURRENCE } from "../schemas/schemas"
import { GET_MONTHLY_OCCURRENCES } from "../general/useTimeline"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"

export default function useCopyTimeline() {
    const navigation = useNavigation<any>()

    const [copyOccurrenceMutation, state] = useMutation(COPY_OCCURRENCE, {})

    const copyTimeline = async ({ timelineId, newDate }: { timelineId: string; newDate?: string }) => {
        try {
            const { data } = await copyOccurrenceMutation({
                variables: { input: { occurrenceId: timelineId, input: newDate ? { newDate } : undefined } },

                refetchQueries: [
                    {
                        query: GET_MONTHLY_OCCURRENCES,
                        variables: { date: moment().format("YYYY-MM-DD") },
                    },
                    {
                        query: GET_MAIN_SCREEN,
                        variables: getMainScreenBaseVariables(),
                    },
                ],

                update(cache, { data: { copyOccurrence } }) {
                    const targetDate = newDate || copyOccurrence.date
                    try {
                        const existing = cache.readQuery({
                            query: GET_OCCURRENCES_QUERY,
                            variables: { date: targetDate },
                        }) as { occurrences: any[] } | null

                        if (existing) {
                            cache.writeQuery({
                                query: GET_OCCURRENCES_QUERY,
                                variables: { date: targetDate },
                                data: { occurrences: [copyOccurrence, ...existing.occurrences] },
                                overwrite: true,
                            })
                        }
                    } catch {
                        // Cache miss — refetch handles it
                    }
                },

                onError: (err) => {
                    console.error("Copy occurrence error:", err)
                    Platform.OS === "android" && ToastAndroid.show("Could not copy event", ToastAndroid.LONG)
                },
            })

            return data?.copyOccurrence
        } catch (error) {
            console.error("Failed to copy occurrence:", error)
            throw error
        }
    }

    return { copyTimeline, loading: state.loading, error: state.error }
}
