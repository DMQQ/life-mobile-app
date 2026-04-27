import { useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import { Platform, ToastAndroid } from "react-native"
import moment from "moment"
import * as Yup from "yup"

import { GET_OCCURRENCES_QUERY } from "../query/useGetOccurrencesQuery"
import { CREATE_EVENT } from "../schemas/schemas"
import { GET_MONTHLY_OCCURRENCES } from "../general/useTimeline"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"

const initialValues = {
    title: "",
    desc: "",
    date: "",
    begin: "",
    end: "",
    tags: "UNTAGGED",
    priority: 5,

    repeatCount: "0",
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

export default function useCreateEvent(props: { selectedDate: string }) {
    const navigation = useNavigation<any>()

    const [createEvent, state] = useMutation(CREATE_EVENT, {})

    const hasRepeat = (input: typeof initialValues) =>
        !!input.repeatCount && input.repeatOn !== "" && !!input.repeatEveryNth

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
                        date: props.selectedDate,
                        priority: input.priority,
                        todos: input.todos ?? [],
                    },
                    ...(hasRepeat(input) && {
                        repeat: {
                            repeatCount: parseInt(input.repeatCount),
                            repeatOn: input.repeatOn,
                            repeatEveryNth: parseInt(input.repeatEveryNth),
                            startDate: props.selectedDate,
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

            update(cache, { data: { createEvent: newOccurrence } }) {
                try {
                    const existing = cache.readQuery({
                        query: GET_OCCURRENCES_QUERY,
                        variables: { date: props.selectedDate },
                    }) as { occurrences: any[] }

                    cache.writeQuery({
                        query: GET_OCCURRENCES_QUERY,
                        variables: { date: props.selectedDate },
                        data: {
                            occurrences: [{ ...newOccurrence, todos: [], images: [] }, ...(existing?.occurrences || [])],
                        },
                        overwrite: true,
                    })
                } catch {
                    // Cache may not exist yet; refetch will handle it
                }
            },

            onError: (err) => {
                console.error("Error creating event:", JSON.stringify(err, null, 2))
                Platform.OS === "android" && ToastAndroid.show("Could not create event", ToastAndroid.LONG)
            },
        })

        navigation.goBack()
    }

    return { initialValues, handleSubmit, validationSchema, state }
}
