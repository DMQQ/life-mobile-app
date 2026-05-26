import { gql, useMutation } from "@apollo/client"
import { StyleSheet, View } from "react-native"
import { navigationRef } from "@/navigation/ref"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { CREATE_EVENT } from "@/features/timeline/hooks/schemas/schemas"
import { GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { GET_MONTHLY_OCCURRENCES } from "@/features/timeline/hooks/general/useTimeline"
import { useState } from "react"
import moment from "moment"
import { ActionRow } from "./ActionRow"

const EDIT_OCCURRENCE_MUTATION = gql`
    mutation EditOccurrenceForm($input: EditOccurrenceArgsInput!) {
        editOccurrence(input: $input) {
            id
            title
            date
            beginTime
            endTime
        }
    }
`

export function FormEventNew({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [createEvent] = useMutation(CREATE_EVENT)

    const begin =
        data.beginTime ??
        moment()
            .add(30 - (moment().minute() % 30), "minutes")
            .startOf("minute")
            .format("HH:mm")
    const end = data.endTime ?? moment(begin, "HH:mm").add(30, "minutes").format("HH:mm")

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await createEvent({
                variables: {
                    input: {
                        input: {
                            title: data.title,
                            description: data.description ?? "",
                            beginTime: begin,
                            endTime: end,
                            date: data.date,
                            tags: data.tags ?? "UNTAGGED",
                            todos: [],
                        },
                    },
                },
                refetchQueries: [
                    { query: GET_OCCURRENCES_QUERY, variables: { date: data.date } },
                    { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
                ],
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        id: "preview",
        seriesId: "",
        isCompleted: false,
        isSkipped: false,
        isRepeat: false,
        tags: "UNTAGGED",
        priority: null,
        todos: [],
        images: [],
        position: 0,
        location: "timeline" as const,
        beginTime: begin,
        endTime: end,
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("TimelineScreens", { screen: "Timeline" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "TimelineCreate",
                params: { selectedDate: preview.date, ...preview },
            } as any)
        }, 100)
    }

    return (
        <View style={{ width: "100%", gap: 8 }}>
            <TimelineItem styles={{ marginBottom: 0, minHeight: 80 }} {...preview} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

export function FormEventEdit({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [editOccurrence] = useMutation(EDIT_OCCURRENCE_MUTATION, {
        refetchQueries: [
            { query: GET_OCCURRENCES_QUERY, variables: { date: data?.date ?? moment().format("YYYY-MM-DD") } },
            { query: GET_MONTHLY_OCCURRENCES, variables: { date: moment().format("YYYY-MM-DD") } },
        ],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await editOccurrence({
                variables: {
                    input: {
                        id: data.id,
                        input: {
                            ...(data.title && { title: data.title }),
                            ...(data.description && { description: data.description }),
                            ...(data.date && { date: data.date }),
                            ...(data.beginTime && { beginTime: data.beginTime }),
                            ...(data.endTime && { endTime: data.endTime }),
                        },
                        scope: "THIS_ONLY",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        id: "preview",
        seriesId: "",
        isCompleted: false,
        isSkipped: false,
        isRepeat: false,
        tags: "UNTAGGED",
        priority: null,
        todos: [],
        images: [],
        position: 0,
        location: "timeline" as const,
        beginTime: "00:00",
        endTime: "00:30",
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("TimelineScreens", { screen: "Timeline" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("TimelineScreens", {
                screen: "TimelineCreate",
                params: { selectedDate: preview.date, ...preview },
            } as any)
        }, 100)
    }

    return (
        <View style={{ width: "100%", gap: 8 }}>
            <TimelineItem styles={{ marginBottom: 0, minHeight: 80 }} {...preview} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

const _s = StyleSheet.create({})
