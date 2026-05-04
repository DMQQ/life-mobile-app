import { createContext, useContext, useMemo, useReducer, useState } from "react"

export type Filters = typeof init

export type Action =
    | { type: "SET_QUERY"; payload: string }
    | { type: "SET_AMOUNT_MIN"; payload: number }
    | { type: "SET_AMOUNT_MAX"; payload: number }
    | { type: "SET_DATE_MIN"; payload: string }
    | { type: "SET_DATE_MAX"; payload: string }
    | { type: "SET_CATEGORY"; payload: string[] }
    | { type: "SET_TYPE"; payload: string | undefined }
    | { type: "TOGGLE_CATEGORY"; payload: string }
    | { type: "SET_SKIP"; payload?: number }
    | { type: "RESET" }
    | { type: "SET_IS_EXACT_CATEGORY"; payload: boolean }
    | { type: "SET_ACCOUNT_ID"; payload: string | undefined }

const reducer = (state: typeof init, action: Action) => {
    if (action.type === "SET_QUERY") {
        return { ...state, query: action.payload }
    }
    if (action.type === "SET_AMOUNT_MIN") {
        return {
            ...state,
            amount: {
                ...state.amount,
                min: action.payload,
            },
        }
    }
    if (action.type === "SET_AMOUNT_MAX") {
        return {
            ...state,
            amount: {
                ...state.amount,
                max: action.payload,
            },
        }
    }

    if (action.type === "SET_DATE_MIN") {
        return {
            ...state,
            date: {
                ...state.date,
                from: action.payload,
            },
        }
    }
    if (action.type === "SET_DATE_MAX") {
        return {
            ...state,
            date: {
                ...state.date,
                to: action.payload,
            },
        }
    }
    if (action.type === "SET_CATEGORY") {
        return {
            ...state,
            category: action.payload,
        }
    }
    if (action.type === "TOGGLE_CATEGORY") {
        const index = state.category.indexOf(action.payload)
        if (index === -1) {
            return {
                ...state,
                category: [...state.category, action.payload],
            }
        } else if (index > -1) {
            return {
                ...state,
                category: state.category.filter((c) => c !== action.payload),
            }
        }
    }
    if (action.type === "SET_TYPE") {
        return {
            ...state,
            type: action.payload,
        }
    }

    if (action.type === "SET_SKIP") {
        return {
            ...state,
            skip: state.take + (action.payload || state.skip),
        }
    }

    if (action.type === "RESET") {
        return init
    }

    if (action.type === "SET_IS_EXACT_CATEGORY") {
        return {
            ...state,
            isExactCategory: action.payload,
        }
    }
    if (action.type === "SET_ACCOUNT_ID") {
        return {
            ...state,
            accountId: action.payload,
        }
    }
    return state
}

const PAGINATION_TAKE = 20

export const init = {
    query: "",
    amount: {
        min: 0,
        max: 999999999,
    },
    date: {
        from: "",
        to: "",
    },

    category: [] as string[],

    type: undefined as string | undefined,

    skip: 0,

    take: PAGINATION_TAKE,

    isExactCategory: false,

    accountId: undefined as string | undefined,
}

type WalletContextType = {
    calendar: {
        date: Date
        setCalendarDate: (date: Date) => void
    }

    filters: Filters

    dispatch: React.Dispatch<Action>

    hasFilters: boolean
    filtersDiffCount: number
}

const WalletContext = createContext<WalletContextType>({
    calendar: {
        date: new Date(),
        setCalendarDate: () => {},
    },

    filters: init,

    dispatch: () => {},

    hasFilters: false,
    filtersDiffCount: 0,
})

export const useWalletContext = () => useContext(WalletContext)

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date())

    const [filters, dispatch] = useReducer(reducer, init)

    const [hasFilters, diffCount] = useMemo(() => {
        let isDifferent = false
        let diffCount = 0

        const flatten = (obj: Record<string, any>, parentKey = ""): Record<string, any> => {
            const output: Record<string, any> = {}
            for (const key in obj) {
                const value = obj[key]
                const newKey = parentKey ? `${parentKey}.${key}` : key
                if (typeof value === "object" && value !== null) Object.assign(output, flatten(value, newKey))
                else output[newKey] = value
            }
            return output
        }

        const flatInit = flatten(init)
        const flatCurrent = flatten(filters)

        for (const key in flatCurrent) {
            if (flatCurrent[key] !== flatInit[key]) {
                isDifferent = true
                diffCount++
            }
        }

        return [isDifferent, diffCount]
    }, [filters])

    const memoizedValue = useMemo(
        () => ({
            calendar: {
                date: selectedCalendarDate,
                setCalendarDate: setSelectedCalendarDate,
            },

            filters,
            dispatch,

            hasFilters,
            filtersDiffCount: diffCount,
        }),
        [selectedCalendarDate, filters, dispatch, hasFilters, diffCount],
    )

    return <WalletContext.Provider value={memoizedValue}>{children}</WalletContext.Provider>
}
