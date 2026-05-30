import { useFormik } from "formik"
import moment from "moment"
import { useRef, useState } from "react"
import { TimelineScreenProps } from "../../types"
import useCreateEvent from "../mutation/useCreateEvent"
import useEditOccurrence from "../mutation/useEditOccurrence"
import useGetOccurrenceById from "../query/useGetOccurrenceById"

import { DATE_FORMAT } from "@/utils/functions/parseDate"
import { useApolloClient } from "@apollo/client"
import BottomSheetType from "@gorhom/bottom-sheet"
import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"
import { GET_MONTHLY_OCCURRENCES } from "./useTimeline"
import type { GeofenceConfig } from "../../components/CreateTimeline/GeofenceSection"
import { registerGeofence, unregisterGeofence } from "../../utils/geofenceTask"

export default function useCreateTimeline({
    route,
    navigation,
    geofence,
}: TimelineScreenProps<"TimelineCreate"> & { geofence: GeofenceConfig | null }) {
    const {
        handleSubmit,
        initialValues,
        validationSchema,
        state: { loading: isLoading },
    } = useCreateEvent({
        selectedDate: route.params.selectedDate,
    })

    const scopeSheetRef = useRef<BottomSheetType>(null)

    const client = useApolloClient()

    const isEditing = route.params.mode === "edit"

    const { data } = useGetOccurrenceById(route.params.timelineId || "", {
        skip: !isEditing || route?.params?.timelineId === undefined,
    })

    const {
        editOccurrence,
        initialFormProps: initialEditFormValues,
        isRepeat,
    } = useEditOccurrence(route.params.timelineId || "", isEditing)

    const initialFormValues =
        isEditing && data !== undefined
            ? initialEditFormValues
            : {
                  ...initialValues,
                  date: route.params.selectedDate,
                  begin: route.params.beginTime ?? moment().format("HH:mm:ss"),
                  end: route.params.endTime ?? moment().add(1, "hours").format("HH:mm:ss"),
                  title: route.params.title ?? "",
                  desc: route.params.description ?? "",
                  notification: "none",

                  scope: "THIS_ONLY",
              }

    const [pendingEdit, setPendingEdit] = useState<{ input: typeof initialFormValues; date: string } | null>(null)

    const handleGeofence = async (occurrenceId: string, title: string) => {
        if (geofence) {
            await registerGeofence({ occurrenceId, title, ...geofence })
        } else {
            await unregisterGeofence(occurrenceId)
        }
    }

    const formikSubmitForm = async (input: typeof initialFormValues) => {
        if (isEditing) {
            if (isRepeat) {
                setPendingEdit({ input, date: route.params.selectedDate })
                scopeSheetRef.current?.expand()
                return
            }
            const id = route.params.timelineId!
            await Promise.all([
                editOccurrence(input as any, route.params.selectedDate, "THIS_ONLY"),
                handleGeofence(id, input.title ?? ""),
            ])
        } else {
            const occurrenceId = await handleSubmit({ ...input, todos: route.params?.todos || [], priority: 1 })
            if (occurrenceId) await handleGeofence(occurrenceId, input.title ?? "")
        }

        await Promise.allSettled([
            client.refetchQueries({ include: [GET_MONTHLY_OCCURRENCES] }),
            client.query({ query: GET_OCCURRENCES_QUERY, variables: { date: input.date } }),
            client.query({ query: GET_OCCURRENCES_QUERY, variables: { date: initialEditFormValues.date } }),
        ])
    }

    const onScopeSelected = async (scope: "THIS_ONLY" | "ALL") => {
        if (!pendingEdit) return
        scopeSheetRef.current?.close()
        const id = route.params.timelineId!
        await Promise.all([
            editOccurrence(pendingEdit.input as any, pendingEdit.date, scope),
            handleGeofence(id, pendingEdit.input.title ?? ""),
        ])
        setPendingEdit(null)

        await Promise.allSettled([
            client.refetchQueries({ include: [GET_MONTHLY_OCCURRENCES] }),
            client.query({
                query: GET_OCCURRENCES_QUERY,
                variables: { date: pendingEdit.input.date },
            }),
        ])
    }

    const f = useFormik({
        onSubmit: formikSubmitForm,
        validationSchema: validationSchema,
        initialValues: initialFormValues,
        enableReinitialize: isEditing,
    })

    const timePicker = (date: Date, type: "begin" | "end") => {
        f.setFieldValue(type, moment(date).format("HH:mm:ss"))
    }

    const handleChangeDate = (date: Date) => {
        f.setFieldValue("date", moment(date).format(DATE_FORMAT))
    }

    const [optionsVisible, setOptionsVisible] = useState(false)

    return {
        f,
        timePicker,
        optionsVisible,
        setOptionsVisible,
        isLoading,
        isEditing,
        initialEditFormValues,
        initialValues,
        handleSubmit,
        scopeSheetRef,
        onScopeSelected,
        isRepeat,
        handleChangeDate,
    }
}
