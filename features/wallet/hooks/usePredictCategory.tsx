import { graphql } from "@/gql/gql"
import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { ResultOf } from "@graphql-typed-document-node/core"

type PredictExpenseQuery = ResultOf<typeof PREDICT_EXPENSE>
export type ExpensePrediction = NonNullable<PredictExpenseQuery["predictExpense"]>

const PREDICT_EXPENSE = graphql(`
    query PredictExpense($input: String!, $amount: Float) {
        predictExpense(input: $input, amount: $amount) {
            description
            amount
            category
            type
            shop
            locationId
            confidence
        }
    }
`)

export default function usePredictExpense(input: [string, number], onPrediction: (data: ExpensePrediction) => void) {
    const [debouncedInput, setDebouncedInput] = useState<string>("")
    const [prediction, setPrediction] = useState<ExpensePrediction | null>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (input && input[0].length >= 3) {
                setDebouncedInput(input[0])
            } else {
                setDebouncedInput("")
            }
        }, 750)

        return () => clearTimeout(timeout)
    }, [input])

    const { data } = useQuery(PREDICT_EXPENSE, {
        variables: { input: debouncedInput },
        skip: !debouncedInput,
        fetchPolicy: "cache-and-network",
        notifyOnNetworkStatusChange: true,
        onCompleted() {
            console.log("fetch completed")
        },
    })

    useEffect(() => {
        if (debouncedInput.length < 3) {
            setPrediction(null)
        }
    }, [debouncedInput])

    useEffect(() => {
        if (data?.predictExpense && data?.predictExpense) {
            onPrediction(data.predictExpense)
            setPrediction(data.predictExpense)
        }
    }, [data?.predictExpense, onPrediction])

    return prediction
}
