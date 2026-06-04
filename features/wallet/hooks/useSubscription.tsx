import { graphql } from "@/gql/gql"
import { useMutation } from "@apollo/client"

const MODIFY_SUBSCRIPTION_MUTATION = graphql(`
    mutation modifySubscription($input: UpdateSubscriptionInput!) {
        modifySubscription(input: $input) {
            id
            amount
            dateStart
            dateEnd
            description
            isActive
            nextBillingDate
            billingCycle
            billingDay
            customBillingMonths
            reminderDaysBeforehand
        }
    }
`)

const CANCEL_SUBSCRIPTION_MUTATION = graphql(`
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
`)

const CREATE_SUBSCRIPTION_MUTATION = graphql(`
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
`)

const CREATE_SUBSCRIPTION_INPUT_MUTATION = graphql(`
    mutation createSubscriptionFromInput($input: CreateSubscriptionInput!) {
        create(input: $input) {
            id
            amount
            dateStart
            dateEnd
            description
            isActive
            nextBillingDate
            billingCycle
            billingDay
            customBillingMonths
            reminderDaysBeforehand
        }
    }
`)

const RENEW_SUBSCRIPTION_MUTATION = graphql(`
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
`)

const ASSIGN_EXPENSE_TO_SUBSCRIPTION_MUTATION = graphql(`
    mutation assignExpenseToSubscription($input: AssignExpenseToSubscriptionInput!) {
        assignExpenseToSubscription(input: $input) {
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
`)

export default function useSubscription() {
    const [cancelSubscription, cancelSubscriptionState] = useMutation(CANCEL_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet", "Subscription"],
    })

    const [createSubscription, createSubscriptionState] = useMutation(CREATE_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet"],
    })

    const [renewSubscription, renewSubscriptionState] = useMutation(RENEW_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet", "Subscription"],
    })

    const [assignExpenseToSubscription, assignExpenseToSubscriptionState] = useMutation(
        ASSIGN_EXPENSE_TO_SUBSCRIPTION_MUTATION,
        {
            refetchQueries: ["GetWallet", "Subscriptions"],
        },
    )

    const [modifySubscription, modifySubscriptionState] = useMutation(MODIFY_SUBSCRIPTION_MUTATION, {
        refetchQueries: ["GetWallet", "Subscription", "Subscriptions"],
    })

    const [createSubscriptionFromInput, createSubscriptionFromInputState] = useMutation(
        CREATE_SUBSCRIPTION_INPUT_MUTATION,
        {
            refetchQueries: ["GetWallet", "WalletOverview", "Subscriptions", "SubAccounts"],
            onError(error) {
                console.log("Error creating subscription:", JSON.stringify(error, null, 2))
            },
        },
    )

    return {
        cancelSubscription,
        cancelSubscriptionState,
        createSubscription,
        createSubscriptionState,
        createSubscriptionFromInput,
        createSubscriptionFromInputState,
        renewSubscription,
        renewSubscriptionState,
        assignExpenseToSubscription,
        assignExpenseToSubscriptionState,
        modifySubscription,
        modifySubscriptionState,
    }
}
