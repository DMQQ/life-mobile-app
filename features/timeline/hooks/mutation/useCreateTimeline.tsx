import { Timeline } from "@/types"
import { useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery"
import { CREATE_TIMELINE_EVENT } from "../schemas/schemas"

import { Platform, ToastAndroid } from "react-native"

import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import moment from "moment"
import * as Yup from "yup"
import { GET_MONTHLY_EVENTS } from "../general/useTimeline"

const initialValues = {
    title: "",
    desc: "",
    date: "",
    begin: "",
    end: "",
    tags: "UNTAGGED",
    repeatCount: "0",
    repeatUntil: "unspecified",
    repeatOn: "",
    repeatEveryNth: "",

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

export default function useCreateTimeline(props: { selectedDate: string }) {
    const navigation = useNavigation<any>()

    const [createTimelineEvent, state] = useMutation(CREATE_TIMELINE_EVENT, {})

    const handleSubmit = async (input: typeof initialValues) => {
        await createTimelineEvent({
            variables: {
                title: input.title,
                desc: input.desc,
                begin: input.begin,
                end: input.end,
                tags: input.tags,
                date: props.selectedDate,

                todos: input.todos ?? [],

                ...(input.repeatCount &&
                    input.repeatOn !== "" && {
                        repeatCount: parseInt(input.repeatCount),
                        repeatUntil: "unspecified",
                        repeatOn: input.repeatOn,
                        repeatEveryNth: parseInt(input.repeatEveryNth),
                    }),
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

            update(cache, { data: { createTimeline } }) {
                const { timeline } = cache.readQuery({
                    query: GET_TIMELINE_QUERY,
                    variables: { date: props.selectedDate },
                }) as { timeline: Timeline[] }

                cache.writeQuery({
                    query: GET_TIMELINE_QUERY,
                    variables: { date: props.selectedDate },
                    data: { timeline: [{ ...createTimeline, todos: [], images: [] }, ...timeline] },
                    overwrite: true,
                })
            },

            onError: (err) => {
                console.error("Error creating timeline:", JSON.stringify(err, null, 2))
                Platform.OS === "android" && ToastAndroid.show("Could not create timeline", ToastAndroid.LONG)
            },
        })

        navigation.goBack()
    }

    return { initialValues, handleSubmit, validationSchema, state }
}
