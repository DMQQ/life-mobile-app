import { useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { Platform, ToastAndroid } from "react-native"
import moment from "moment"
import * as Yup from "yup"

import { CREATE_EVENT } from "../schemas/schemas"
import { GET_MONTHLY_OCCURRENCES } from "../general/useTimeline"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useMemo } from "react"

const initialValues = {
    title: "",
    desc: "",
    date: "",
    begin: "",
    end: "",
    tags: "UNTAGGED",
    priority: 5,

    repeatType: "",
    repeatDaysOfWeek: [] as number[],
    repeatInterval: "1",
    repeatCount: "0",
    repeatUntil: "",
    repeatOn: "",
    repeatEveryNth: "",
    reminderBeforeMinutes: "" as string | number,
    todos: [] as string[],
}

export type InitialValuesType = typeof initialValues

const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    desc: Yup.string(),
    date: Yup.string().required("Date is required"),
    begin: Yup.string().required("Begin time is required"),
    end: Yup.string().required("End time is required"),
    tags: Yup.string().required("Tags are required"),
})

export default function useCreateEvent(props: { selectedDate: string }) {
    const navigation = useNavigation<any>()

    const [createEvent, state] = useMutation(CREATE_EVENT, {})

    const hasRepeat = (input: typeof initialValues) =>
        input.repeatType !== "" || (!!input.repeatCount && input.repeatOn !== "" && !!input.repeatEveryNth)

    const handleSubmit = async (input: typeof initialValues) => {
        await createEvent({
            variables: {
                input: {
                    input: {
                        title: input.title,
                        description: input.desc,
                        beginTime: input.begin,
                        endTime: input.end,
                        tags: input.tags,
                        date: input.date,
                        priority: input.priority,
                        todos: input.todos ?? [],
                    },
                    ...(hasRepeat(input) && {
                        repeat: {
                            repeatCount: parseInt(input.repeatCount) || undefined,
                            repeatOn: input.repeatOn || undefined,
                            repeatEveryNth: parseInt(input.repeatEveryNth) || undefined,
                            startDate: props.selectedDate,
                            ...(input.repeatType && {
                                repeatType: input.repeatType,
                                repeatDaysOfWeek:
                                    input.repeatDaysOfWeek.length > 0 ? input.repeatDaysOfWeek : undefined,
                                repeatInterval: parseInt(input.repeatInterval) || 1,
                                repeatUntil: input.repeatUntil || undefined,
                            }),
                            ...(input.reminderBeforeMinutes !== "" && {
                                reminderBeforeMinutes: parseInt(String(input.reminderBeforeMinutes)),
                            }),
                        },
                    }),
                },
            },

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

            update(cache) {
                cache.evict({ fieldName: "occurrences" })
                cache.gc()
            },

            onError: (err) => {
                console.error("Error creating event:", JSON.stringify(err, null, 2))
                Platform.OS === "android" && ToastAndroid.show("Could not create event", ToastAndroid.LONG)
            },
        })

        navigation.goBack()
    }

    const initialValuesMemo = useMemo<InitialValuesType>(
        () => ({
            ...initialValues,
            date: props.selectedDate as string,
        }),
        [props.selectedDate],
    )

    return { initialValues: initialValuesMemo, handleSubmit, validationSchema, state }
}
