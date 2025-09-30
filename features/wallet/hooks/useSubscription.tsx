import { gql, useMutation } from "@apollo/client"

const CANCEL_SUBSCRIPTION_MUTATION = gql`
    mutation cancelSubscription($subscriptionId: ID!) {
        cancelSubscription(subscriptionId: $subscriptionId) {
            id
            amount
            date
            description
            type
            category
            balanceBeforeInteraction
            note
            subscription {
                id
                isActive
                nextBillingDate
                dateStart
            }
        }
    }
`

const CREATE_SUBSCRIPTION_MUTATION = gql`
    mutation createSubscription($expenseId: ID!) {
        createSubscription(expenseId: $expenseId) {
            id
            amount
            date
            description
            type
            category
            balanceBeforeInteraction
            note
            subscription {
                id
                isActive
                nextBillingDate
                dateStart
            }
        }
    }
`

const RENEW_SUBSCRIPTION_MUTATION = gql`
    mutation renewSubscription($subscriptionId: ID!) {
        renewSubscription(subscriptionId: $subscriptionId) {
            id
            amount
            date
            description
            type
            category
            balanceBeforeInteraction
            note
            subscription {
                id
                isActive
                nextBillingDate
                dateStart
            }
        }
    }
`

export default function useSubscription() {
    const [cancelSubscription, cancelSubscriptionState] = useMutation(CANCEL_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet"],
    })

    const [createSubscription, createSubscriptionState] = useMutation(CREATE_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet"],
    })

    const [renewSubscription, renewSubscriptionState] = useMutation(RENEW_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet"],
    })

    return {
        cancelSubscription,
        cancelSubscriptionState,
        createSubscription,
        createSubscriptionState,
        renewSubscription,
        renewSubscriptionState,
    }
}
