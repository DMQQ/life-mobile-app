import { useFormik } from "formik"
import moment from "moment"
import { useRef, useState } from "react"
import { TimelineScreenProps } from "../../types"
import useCreateTimelineMutation from "../mutation/useCreateTimeline"
import useEditTimeline from "../mutation/useEditTimeline"
import useGetTimelineById from "../query/useGetTimelineById"

import { DATE_FORMAT } from "@/utils/functions/parseDate"
import { useApolloClient } from "@apollo/client"
import BottomSheetType from "@gorhom/bottom-sheet"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"
import { GET_MONTHLY_EVENTS } from "./useTimeline"

export default function useCreateTimeline({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
    const {
        handleSubmit,
        initialValues,
        validationSchema,
        state: { loading: isLoading },
    } = useCreateTimelineMutation({
        selectedDate: route.params.selectedDate,
    })

    const sheetRef = useRef<BottomSheetType>(null)

    const client = useApolloClient()

    const isEditing = route.params.mode === "edit"

    const { data } = useGetTimelineById(route.params.timelineId || "", {
        skip: !isEditing || route?.params?.timelineId === undefined,
    })

    const { editTimeline, initialFormProps: initialEditFormValues } = useEditTimeline(
        route.params.timelineId || "",
        isEditing,
    )

    const initialFormValues =
        isEditing && data !== undefined
            ? initialEditFormValues
            : {
                  ...initialValues,
                  date: route.params.selectedDate,
                  begin: moment().format("HH:mm:ss"),
                  end: moment().add(1, "hours").format("HH:mm:ss"),
                  notification: "none",
              }

    const formikSubmitForm = async (input: typeof initialFormValues) => {
        if (isEditing) {
            await editTimeline(input, route.params.selectedDate)
        } else {
            await handleSubmit({ ...input, todos: route.params?.todos || [] })
        }

        await Promise.allSettled([
            client.refetchQueries({
                include: [GET_MONTHLY_EVENTS],
            }),
            client.query({
                query: GET_TIMELINE_QUERY,
                variables: { date: input.date },
            }),
            client.query({
                query: GET_TIMELINE_QUERY,
                variables: { date: initialEditFormValues.date },
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
        sheetRef,
        handleChangeDate,
    }
}
