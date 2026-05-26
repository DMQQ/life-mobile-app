import { gql, useMutation } from "@apollo/client"
import Colors from "@/constants/Colors"
import { StyleSheet, View } from "react-native"
import { navigationRef } from "@/navigation/ref"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import { invalidateGetMainScreen } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useState } from "react"
import moment from "moment"
import { ActionRow } from "./ActionRow"

const NOOP = () => {}

const CREATE_EXPENSE_MUTATION = gql`
    mutation CreateExpenseForm($input: CreateExpenseInput!) {
        createExpense(input: $input) {
            id
            amount
            description
            date
            type
            category
        }
    }
`

const EDIT_EXPENSE_MUTATION = gql`
    mutation EditExpenseForm($input: EditExpenseInput!) {
        editExpense(input: $input) {
            id
        }
    }
`

export function FormExpenseNew({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, {
        refetchQueries: ["GetWallet", invalidateGetMainScreen()],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await createExpense({
                variables: {
                    input: {
                        amount: data.amount,
                        description: data.description,
                        date: data.date,
                        type: data.type ?? "expense",
                        category: data.category ?? "OTHER",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = { id: "preview", balanceBeforeInteraction: 0, type: "expense", category: "OTHER", ...data }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("WalletScreens", { screen: "Wallet" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("WalletScreens", {
                screen: "CreateExpense",
                params: { ...preview, isEditing: false },
            } as any)
        }, 100)
    }

    return (
        <View style={s.stretch}>
            <WalletItem {...preview} handlePress={NOOP} animatedStyle={{}} containerStyle={{ marginBottom: 0 }} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

export function FormExpenseEdit({ data, onNavigate }: { data: any; onNavigate?: () => void }) {
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
    const [editExpense] = useMutation(EDIT_EXPENSE_MUTATION, {
        refetchQueries: ["GetWallet", invalidateGetMainScreen()],
    })

    const onConfirm = async () => {
        setStatus("loading")
        try {
            await editExpense({
                variables: {
                    input: {
                        expenseId: data.id,
                        amount: data.amount,
                        description: data.description,
                        date: data.date,
                        type: data.type ?? "expense",
                        category: data.category ?? "OTHER",
                    },
                },
            })
            setStatus("done")
        } catch {
            setStatus("error")
        }
    }

    const preview = {
        balanceBeforeInteraction: 0,
        type: "expense",
        category: "OTHER",
        date: moment().format("YYYY-MM-DD"),
        ...data,
    }

    const onEdit = () => {
        onNavigate?.()
        navigationRef.current?.navigate("WalletScreens", { screen: "Wallet" } as any)
        setTimeout(() => {
            navigationRef.current?.navigate("WalletScreens", {
                screen: "CreateExpense",
                params: { ...preview, isEditing: true },
            } as any)
        }, 100)
    }

    return (
        <View style={s.stretch}>
            <WalletItem {...preview} handlePress={NOOP} animatedStyle={{}} containerStyle={{ marginBottom: 0 }} />
            <ActionRow status={status} onSave={onConfirm} onEdit={onEdit} />
        </View>
    )
}

const s = StyleSheet.create({
    stretch: { alignSelf: "stretch" },
})
