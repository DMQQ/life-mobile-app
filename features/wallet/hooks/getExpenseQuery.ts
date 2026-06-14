import { gql } from "@apollo/client"

export const GET_EXPENSE = gql`
    query Expense($id: ID!) {
        expense(expenseId: $id) {
            ...ExpenseDetails
        }

        expenseSimilar(expenseId: $id, limit: 20) {
            ...ExpenseDetails
        }

        wallet {
            income
            monthlyPercentageTarget
        }
    }

    fragment ExpenseDetails on ExpenseEntity {
        id
        amount
        date
        description
        type
        category
        balanceBeforeInteraction
        spontaneousRate
        subAccountId
        note
        shop
        shopEntity {
            id
            name
            image
        }
        tags

        subscription {
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
            totalSpent
            totalAmount
            totalDuration
        }

        location {
            id
            kind
            name
            latitude
            longitude
        }

        files {
            id
            url
        }

        subexpenses {
            id
            description
            amount
            category
        }
    }
`
