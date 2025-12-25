import { Expense, Wallet } from "@/types"
import { gql, useQuery } from "@apollo/client"
import { useCallback, useEffect, useMemo, useState } from "react"
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

            expenses(filters: $filters, take: $take, skip: $skip) {
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
`

const PAGINATION_TAKE = 20

export default function useGetWallet(options?: {
    fetchAll?: boolean
    excludeFields?: string[]
    defaultFilters?: Partial<typeof init>
}) {
    const { filters, dispatch } = useWalletContext()

    const [skip, setSkip] = useState(0)
    const [endReached, setEndReached] = useState(false)

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
        }),
        [effectiveFilters],
    )

    const st = useQuery(GET_WALLET, {
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

    const onEndReached = useCallback(async () => {
        if (st.loading || endReached || options?.fetchAll) return

        const nextSkip = skip + PAGINATION_TAKE

        try {
            await st.fetchMore({
                variables: {
                    skip: nextSkip,
                    take: PAGINATION_TAKE,
                    filters: baseFilters,
                    ...directiveVariables,
                },
                updateQuery(previousQueryResult, { fetchMoreResult }) {
                    if (!fetchMoreResult || !fetchMoreResult.wallet || !fetchMoreResult.wallet.expenses) {
                        setEndReached(true)
                        return previousQueryResult
                    }

                    const newExpenses = fetchMoreResult.wallet.expenses
                    if (newExpenses.length === 0 || newExpenses.length < PAGINATION_TAKE) {
                        setEndReached(true)
                    }

                    if (!previousQueryResult?.wallet?.expenses) {
                        return fetchMoreResult
                    }

                    const mergeExpenses = (previousExpenses: Expense[], newExpenses: Expense[]): Expense[] =>
                        Array.from(new Map([...previousExpenses, ...newExpenses].map((exp) => [exp.id, exp])).values())

                    return {
                        wallet: {
                            ...previousQueryResult.wallet,
                            ...fetchMoreResult.wallet,
                            expenses: mergeExpenses(previousQueryResult.wallet.expenses, newExpenses),
                        },
                    }
                },
            })

            setSkip(nextSkip)
        } catch (error) {
            console.error("Error loading more:", error)
        }
    }, [st.loading, endReached, skip, baseFilters, directiveVariables, options?.fetchAll])

    useEffect(() => {
        const timeout = setTimeout(async () => {
            setSkip(0)
            setEndReached(false)

            await st.refetch({
                skip: 0,
                take: options?.fetchAll ? 99999 : PAGINATION_TAKE,
                filters: baseFilters,
                ...directiveVariables,
            })
        }, 1000)

        return () => clearTimeout(timeout)
    }, [effectiveFilters])

    const filtersActive = useMemo(() => JSON.stringify(effectiveFilters) !== JSON.stringify(init), [effectiveFilters])

    const data = useMemo(() => st.data as { wallet: Wallet }, [st.data])

    return { ...st, data, filters: effectiveFilters, dispatch, onEndReached, endReached, filtersActive }
}

export const useGetBalance = () => {
    const { data } = useGetWallet({ fetchAll: false })
    return data?.wallet?.balance || 0
}
