import { useEffect } from "react"
import { useQuery, gql } from "@apollo/client"
import store from "../store"
import { ExtensionStorage } from "@bacons/apple-targets"
import moment from "moment"

const GET_EXPENSES_LEGEND = gql`
    query ExpensesLegend($startDate: String!, $endDate: String!, $detailed: String!) {
        statisticsLegend(startDate: $startDate, endDate: $endDate, displayMode: $detailed) {
            category
            count
            total
            percentage
        }
    }
`

interface ExpenseCategory {
    category: string
    count: string
    total: number
    percentage: number
}

interface ExpensesData {
    statisticsLegend: ExpenseCategory[]
    lastUpdated: string
}

export const useWidgetExpensesData = () => {
    const now = moment()
    const startOfMonth = now.clone().startOf("month")
    const endOfMonth = now.clone().endOf("month")

    const { data } = useQuery(GET_EXPENSES_LEGEND, {
        variables: {
            startDate: startOfMonth.format("YYYY-MM-DD"),
            endDate: endOfMonth.format("YYYY-MM-DD"),
            detailed: "general",
        },
    })

    useEffect(() => {
        if (!data?.statisticsLegend) return

        const expensesData: ExpensesData = {
            statisticsLegend: data.statisticsLegend,
            lastUpdated: new Date().toISOString(),
        }

        store.set("expenses_data", JSON.stringify(expensesData))
        ExtensionStorage.reloadWidget()
    }, [data])
}

export default useWidgetExpensesData
