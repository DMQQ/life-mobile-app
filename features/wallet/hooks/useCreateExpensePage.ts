import useCreateActivity from "@/features/wallet/hooks/useCreateActivity"
import { useApolloClient } from "@apollo/client"
import { useEditExpense } from "@/features/wallet/hooks/useEditExpense"
import { useCallback, useEffect, useState } from "react"
import moment from "moment/moment"
import { Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import { cancelAnimation, useSharedValue, withSpring } from "react-native-reanimated"
import { useUploadSubExpense } from "@/features/wallet/hooks/useUploadSubExpense"
import { Expense } from "@/types"
import { useNavigation } from "@react-navigation/native"
import usePredictExpense from "@/features/wallet/hooks/usePredictCategory"

interface SubExpense {
    id: string
    description: string
    amount: number

    category: keyof typeof Icons
}

export default function useCreateExpensePage(
    params: Expense & {
        isEditing: boolean
        type: "expense" | "income"
    },
) {
    const { createExpense, loading } = useCreateActivity({
        onCompleted() {},
    })
    const navigation = useNavigation()

    const client = useApolloClient()

    const editExpense = useEditExpense()

    const [amount, setAmount] = useState<string>(params?.amount.toString() || "0")
    const [date, setDate] = useState<null | string>(
        params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
    )
    const [changeView, setChangeView] = useState(false)
    const [category, setCategory] = useState<keyof typeof Icons>(params.category || "none")
    const [name, setName] = useState(params?.description || "")
    const [type, setType] = useState<"expense" | "income" | null>(params?.type || null)
    const [isSubscription, setIsSubscription] = useState(false)

    const [spontaneousRate, setSpontaneousRate] = useState(params?.spontaneousRate || 0)

    const [isSubExpenseMode, setIsSubExpenseMode] = useState(false)

    const [SubExpenses, setSubExpenses] = useState<SubExpense[]>([])

    const [uploadSubexpenses, state] = useUploadSubExpense(() => {})

    const handleSubmit = async () => {
        if (isSubExpenseMode) {
            handleAddSubexpense()

            return
        }

        const parseAmount = (amount: string) => {
            if (amount.endsWith(".")) return +amount.slice(0, -1)

            if (amount.includes(".")) {
                const [int, dec] = amount.split(".")
                if (dec.length > 2) {
                    return +int + +`0.${dec.slice(0, 2)}`
                }
            }

            return +amount
        }

        if (!isValid) {
            shake()
            return
        }

        if (params?.isEditing) {
            await editExpense({
                variables: {
                    amount: parseAmount(amount),
                    description: name,
                    type: type,
                    category: category,
                    expenseId: params.id,
                    date: date,
                    spontaneousRate,
                },
            }).catch((e) => console.log(e))

            if (SubExpenses.length > 0) {
                await uploadSubexpenses({
                    variables: {
                        expenseId: params.id,
                        input: SubExpenses.map((item) => ({
                            description: item.description,
                            amount: item.amount,
                            category: item.category,
                        })),
                    },
                })
            }

            try {
                await client?.refetchQueries({
                    include: ["GetWallet", "Limits", "StatisticsDayOfWeek", "GetZeroSpendings"],
                })

                console.log("Refetched queries successfully")
            } catch (error) {
                console.log("Error refetching queries:", error)
            }

            navigation.goBack()

            return
        }

        const { data, errors } = await createExpense({
            variables: {
                amount: parseAmount(amount),
                description: name,
                type: type,
                category: category,
                date: date ?? moment().format("YYYY-MM-DD"),
                schedule: moment(date).isAfter(moment()),
                isSubscription: isSubscription,
                spontaneousRate: spontaneousRate,
            },
        })

        const id = data.createExpense.id

        if (SubExpenses.length > 0) {
            await uploadSubexpenses({
                variables: {
                    expenseId: id,
                    input: SubExpenses.map((item) => ({
                        description: item.description,
                        amount: item.amount,
                        category: item.category,
                    })),
                },
            })
        }

        await client?.refetchQueries({
            include: ["GetWallet", "Limits", "StatisticsDayOfWeek", "GetZeroSpendings"],
        })

        navigation.goBack()
    }

    useEffect(() => {
        if (type === "income") setCategory("income")
        else if (type === "expense" && category === "income") setCategory("none")
    }, [type, category])

    const handleAddSubexpense = () => {
        if (amount === "0") return shake()

        setSubExpenses((prev) => [
            ...prev,
            {
                id: Math.random().toString(),
                description: name,
                amount: +amount,
                category: category,
            },
        ])
        setAmount("0")
        setName("")
    }

    const calculateSubExpensesTotal = () => {
        return SubExpenses.reduce((acc, item) => acc + item.amount, 0)
    }

    const handleAmountChange = useCallback((value: string) => {
        return setAmount((prev) => {
            if (value === "C") {
                const val = prev.toString().slice(0, -1)

                return val.length === 0 ? "0" : val
            }

            if (typeof +value === "number" && prev.includes(".") && prev.split(".")[1].length === 2) {
                shake()
                return prev
            }

            if (prev.length === 1 && prev === "0" && value !== ".") {
                return value
            }
            if (prev.includes(".") && value === ".") {
                shake()
                return prev
            }
            if (prev.length === 0 && value === ".") {
                return "0."
            }
            return prev + value
        })
    }, [])

    const isAnimating = useSharedValue(false)
    const transformX = useSharedValue(0)

    const [regularModeState, setRegularModeState] = useState({
        amount: params?.amount?.toString() || "0",
        date: params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
        category: params?.category || "none",
        name: params?.description || "",
        type: params?.type || null,
    })

    const shake = () => {
        if (isAnimating.value) return

        isAnimating.value = true
        cancelAnimation(transformX)
        transformX.value = withSpring(15, { damping: 2, stiffness: 200, mass: 0.5 })

        setTimeout(() => {
            transformX.value = withSpring(-15, { damping: 2, stiffness: 200, mass: 0.5 })
            setTimeout(() => {
                transformX.value = withSpring(0, { damping: 2, stiffness: 200, mass: 0.5 }, (finished) => {
                    if (finished) isAnimating.value = false
                })
            }, 50)
        }, 50)
    }

    const handleToggleSubExpenseMode = () => {
        setType("expense")
        if (!isSubExpenseMode) {
            setRegularModeState({
                amount: amount === "0" ? calculateSubExpensesTotal().toString() : amount,
                date: date as any,
                category,
                name,
                type: type! as "income" | "expense",
            })

            setAmount("0")
            setName("")
            setIsSubExpenseMode(true)
        } else {
            if (params?.isEditing) {
                restorePreviousState()
            } else {
                setAmount(regularModeState.amount)
                setDate(regularModeState.date)
                setCategory(regularModeState.category)
                setName(regularModeState.name)
                setType(regularModeState.type)
            }
            setIsSubExpenseMode(false)
        }
    }

    const restorePreviousState = () => {
        setAmount(params?.amount.toString() || "0")
        setDate(params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"))
        setChangeView(false)
        setCategory(params.category || "none")
        setName(params?.description || "")
        setType(params?.type || null)
    }

    const isValid = type !== null && name !== "" && amount !== "" && type !== null && amount !== "0" && date !== null

    const prediction = usePredictExpense([name, +amount], () => {})

    useEffect(() => {
        if (params?.isEditing) {
            restorePreviousState()

            setRegularModeState({
                amount: params?.amount?.toString() || "0",
                date: params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                category: params?.category || "none",
                name: params?.description || "",
                type: params?.type || null,
            })
        }
    }, [params])

    const applyPrediction = useCallback(() => {
        if (!prediction) return

        if (amount === "0") setAmount(prediction.amount.toString())
        setType(prediction.type as "expense" | "income")
        setCategory(prediction.category as keyof typeof Icons)
    }, [prediction, amount])

    const canPredict = !isValid && prediction

    const setExpense = (expense: Expense) => {
        setAmount(expense.amount.toString())
        setName(expense.description)
        setType(expense.type as "expense" | "income")
        setCategory(expense.category as keyof typeof Icons)
        setDate(moment(expense.date).format("YYYY-MM-DD"))
        setSpontaneousRate(expense.spontaneousRate || 0)
        setIsSubscription(false)
        setSubExpenses((expense.subexpenses as any) || [])
    }

    return {
        setAmount,
        setExpense,
        prediction,
        handleAmountChange,
        handleAddSubexpense,
        applyPrediction,
        canPredict,
        handleToggleSubExpenseMode,
        handleSubmit,
        type,
        amount,
        SubExpenses,
        calculateSubExpensesTotal,
        transformX,
        name,
        setName,
        isSubExpenseMode,
        date,
        setDate,
        changeView,
        isValid,
        loading,
        category,
        setType,
        setIsSubExpenseMode,
        setChangeView,
        spontaneousRate,
        setSpontaneousRate,
        setSubExpenses,
        setCategory,
        setIsSubscription,
    }
}
