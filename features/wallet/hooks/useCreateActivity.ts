import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { gql, useMutation } from "@apollo/client"
import { Platform, ToastAndroid } from "react-native"

const CREATE_EXPENSE = gql`
    mutation CreateExpense(
        $amount: Float!
        $description: String!
        $type: String!
        $category: String!
        $date: String!
        $schedule: Boolean
        $isSubscription: Boolean
        $spontaneousRate: Float
    ) {
        createExpense(
            amount: $amount
            description: $description
            type: $type
            category: $category
            date: $date
            schedule: $schedule
            isSubscription: $isSubscription
            spontaneousRate: $spontaneousRate
        ) {
            id
            amount
            description
            date
            type
            category
            balanceBeforeInteraction
            schedule

            subscription {
                id
                isActive
                nextBillingDate
                dateStart
            }
            subexpenses {
                id
                description
                amount
                category
            }

            files {
                id
                url
            }
        }
    }
`

export default function useCreateActivity(props: { onCompleted?: () => void }) {
    const [createExpense, { data, loading, error, called, reset }] = useMutation(CREATE_EXPENSE, {
        async onCompleted(data, client) {
            await props.onCompleted?.()

            if (data.createExpense.schedule === false) {
            } else if (Platform.OS === "android") {
                ToastAndroid.show("Expense has been scheduled", ToastAndroid.SHORT)
            }
        },
        refetchQueries: [invalidateGetMainScreen()],
        onError: (er) => JSON.stringify(er, null, 2),
    })

    return { createExpense, data, loading, error, called, reset }
}
