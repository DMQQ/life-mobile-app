import { createContext, useContext } from "react"
import { Expense } from "@/types"

interface ExpenseContextValue {
    expense: Expense
}

const ExpenseContext = createContext<ExpenseContextValue>({} as ExpenseContextValue)

export function useExpense() {
    return useContext(ExpenseContext).expense
}

export default ExpenseContext
