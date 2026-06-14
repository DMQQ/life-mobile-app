import { createContext, useContext } from "react"
import { SharedValue } from "react-native-reanimated"
import { AddSubExpenseSheetHandle } from "@/features/wallet/components/Expense/AddSubExpenseSheet"
import { Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import { Expense } from "@/types"

export type ViewType = "main" | "category" | "spontaneous" | "account"

export interface SubExpense {
    id: string
    description: string
    amount: number
    category: keyof typeof Icons
}

type Type = "expense" | "income" | null

export interface CreateExpenseContextType {
    state: {
        prediction: any
        canPredict: any
        type: Type
        amount: string
        SubExpenses: SubExpense[]
        name: string
        isSubExpenseMode: boolean
        date: string | null
        isValid: boolean
        loading: boolean
        category: keyof typeof Icons
        view: ViewType
        spontaneousRate: number
        subAccountId: string | null
        optionsCollapsed: boolean
        shop: string
        shopEntityId: string | null
        note: string
        tags: string
    }
    methods: {
        setAmount: (amount: string) => void
        setExpense: (expense: Expense) => void
        handleAmountChange: (value: string) => void
        handleAddSubexpense: () => void
        applyPrediction: () => void
        handleToggleSubExpenseMode: () => void
        handleSubmit: () => void
        calculateSubExpensesTotal: () => number
        setName: (name: string) => void
        setDate: (date: string | null) => void
        setType: (type: "expense" | "income" | "refunded" | null) => void
        setIsSubExpenseMode: (mode: boolean) => void
        setView: (view: ViewType) => void
        setSpontaneousRate: (rate: number) => void
        setSubExpenses: (subExpenses: SubExpense[] | ((prev: SubExpense[]) => SubExpense[])) => void
        setCategory: (category: keyof typeof Icons) => void
        setIsSubscription: (isSubscription: boolean) => void
        setSubAccountId: (id: string | null) => void
        setOptionsCollapsed: (collapsed: boolean) => void
        setShop: (shop: string) => void
        setShopEntityId: (id: string | null) => void
        setNote: (note: string) => void
        setTags: (tags: string) => void
    }
    animated: {
        transformX: SharedValue<number>
        optionsProgress: SharedValue<number>
    }
    isInputFocused: boolean
    setIsInputFocused: (focused: boolean) => void
    subexpenseSheetRef: React.RefObject<AddSubExpenseSheetHandle | null>
}

export const CreateExpenseContext = createContext<CreateExpenseContextType | null>(null)

export function CreateExpenseProvider({ children, value }: { children: React.ReactNode; value: CreateExpenseContextType }) {
    return <CreateExpenseContext.Provider value={value}>{children}</CreateExpenseContext.Provider>
}

export function useCreateExpenseContext() {
    const ctx = useContext(CreateExpenseContext)
    if (!ctx) throw new Error("useCreateExpenseContext must be used within CreateExpenseProvider")
    return ctx
}
