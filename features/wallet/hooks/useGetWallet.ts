import { MonthlyExpenses, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { init, useWalletContext } from "../components/WalletContext"

export const GET_WALLET = gql`
    query GetWallet(
        $filters: GetWalletFilters
        $skip: Int
        $take: Int
        $includeFiles: Boolean = true
        $includeSubexpenses: Boolean = true
        $includeSubscription: Boolean = true
        $includeLocation: Boolean = true
    ) {
        wallet {
            id
            balance
            income
            monthlyPercentageTarget

            expenses2(filters: $filters, take: $take, skip: $skip) {
                month
                flow {
                    income
                    expense
                }
                expenses {
                    id
                    amount
                    date
                    description
                    type
                    category

                    subscription @include(if: $includeSubscription) {
                        id
                        isActive
                        nextBillingDate
                        dateStart
                    }

                    location @include(if: $includeLocation) {
                        id
                    }

                    files @include(if: $includeFiles) {
                        id
                    }

                    subexpenses @include(if: $includeSubexpenses) {
                        id
                    }
                }
            }
        }
    }
`

const PAGINATION_TAKE = 3 // months

export default function useGetWallet(options?: {
    fetchAll?: boolean
    excludeFields?: string[]
    defaultFilters?: Partial<typeof init>
}) {
    const { filters, dispatch } = useWalletContext()

    const skipRef = useRef(0)
    const fetchingRef = useRef(false)
    const generationRef = useRef(0)
    const isFirstMount = useRef(true)
    const isFilterResetRef = useRef(false)
    const [endReached, setEndReached] = useState(false)
    const [paginatedMonths, setPaginatedMonths] = useState<MonthlyExpenses[]>([])

    const directiveVariables = useMemo(() => {
        const excludeFields = options?.excludeFields || []
        return {
            includeFiles: !excludeFields.includes("files"),
            includeSubexpenses: !excludeFields.includes("subexpenses"),
            includeSubscription: !excludeFields.includes("subscription"),
            includeLocation: !excludeFields.includes("location"),
        }
    }, [options?.excludeFields])

    const effectiveFilters = useMemo(() => {
        const defaultFilters = options?.defaultFilters || {}

        return {
            query: filters.query || defaultFilters.query || init.query,
            amount: {
                min:
                    filters.amount.min !== init.amount.min
                        ? filters.amount.min
                        : (defaultFilters.amount?.min ?? init.amount.min),
                max:
                    filters.amount.max !== init.amount.max
                        ? filters.amount.max
                        : (defaultFilters.amount?.max ?? init.amount.max),
            },
            date: {
                from: filters.date.from || defaultFilters.date?.from || init.date.from,
                to: filters.date.to || defaultFilters.date?.to || init.date.to,
            },
            category: filters.category.length > 0 ? filters.category : defaultFilters.category || init.category,
            type: filters.type || defaultFilters.type || init.type,
            isExactCategory:
                filters.isExactCategory !== init.isExactCategory
                    ? filters.isExactCategory
                    : (defaultFilters.isExactCategory ?? init.isExactCategory),
            skip: filters.skip || defaultFilters.skip || init.skip,
            take: filters.take || defaultFilters.take || init.take,

            accountId: filters.accountId,
        }
    }, [filters, options?.defaultFilters])

    const baseFilters = useMemo(
        () => ({
            title: effectiveFilters.query,
            amount: {
                from: effectiveFilters.amount.min,
                to: effectiveFilters.amount.max,
            },
            date: {
                from: effectiveFilters.date.from,
                to: effectiveFilters.date.to,
            },
            category: effectiveFilters.category,
            ...(effectiveFilters.type && { type: effectiveFilters.type }),
            ...(effectiveFilters.isExactCategory && { isExactCategory: effectiveFilters.isExactCategory }),
            ...(effectiveFilters.accountId && { accountId: effectiveFilters.accountId }),
        }),
        [effectiveFilters],
    )

    const st = useQuery<{ wallet: Wallet }>(GET_WALLET, {
        variables: {
            filters: baseFilters,
            skip: 0,
            take: options?.fetchAll ? 99999 : PAGINATION_TAKE,
            ...directiveVariables,
        },
        onError: (err) => {
            console.log(JSON.stringify(err, null, 2))
        },
    })

    useEffect(() => {
        const months = st.data?.wallet?.expenses2
        if (!months || isFilterResetRef.current) return
        setPaginatedMonths((prev) => {
            if (prev.length === 0) return months
            const map = new Map(prev.map((m) => [m.month, m]))
            for (const m of months) map.set(m.month, m)
            return Array.from(map.values())
        })
    }, [st.data?.wallet?.expenses2])

    const onEndReached = useCallback(async () => {
        if (endReached || options?.fetchAll || fetchingRef.current) return

        fetchingRef.current = true
        const nextSkip = skipRef.current + PAGINATION_TAKE
        const gen = generationRef.current

        try {
            const result = await st.fetchMore({
                variables: {
                    skip: nextSkip,
                    take: PAGINATION_TAKE,
                    filters: baseFilters,
                    ...directiveVariables,
                },
            })

            if (gen !== generationRef.current) return

            const newMonths: MonthlyExpenses[] = result.data?.wallet?.expenses2 ?? []
            if (newMonths.length < PAGINATION_TAKE) setEndReached(true)
            if (newMonths.length === 0) return

            setPaginatedMonths((prev) => {
                const map = new Map(prev.map((m) => [m.month, m]))
                for (const m of newMonths) map.set(m.month, m)
                return Array.from(map.values())
            })

            skipRef.current = nextSkip
        } catch (error) {
            console.error("Error loading more:", error)
        } finally {
            fetchingRef.current = false
        }
    }, [endReached, baseFilters, directiveVariables, options?.fetchAll])

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }

        const timeout = setTimeout(async () => {
            const gen = ++generationRef.current
            skipRef.current = 0
            fetchingRef.current = false
            setEndReached(false)
            isFilterResetRef.current = true

            const result = await st.refetch({
                skip: 0,
                take: options?.fetchAll ? 99999 : PAGINATION_TAKE,
                filters: baseFilters,
                ...directiveVariables,
            })

            if (gen === generationRef.current) {
                isFilterResetRef.current = false
                setPaginatedMonths(result.data?.wallet?.expenses2 ?? [])
            }
        }, 1000)

        return () => clearTimeout(timeout)
    }, [effectiveFilters])

    const mergedData = useMemo(() => {
        if (!st.data?.wallet) return st.data
        return { wallet: { ...st.data.wallet, expenses2: paginatedMonths } }
    }, [st.data, paginatedMonths])

    const filtersActive = useMemo(() => JSON.stringify(effectiveFilters) !== JSON.stringify(init), [effectiveFilters])

    return { ...st, data: mergedData, filters: effectiveFilters, dispatch, onEndReached, endReached, filtersActive }
}

export const useGetBalance = () => {
    const { data } = useGetWallet({ fetchAll: false })
    return data?.wallet?.balance || 0
}
