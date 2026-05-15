import { useLocalSearchParams, useNavigation } from "expo-router"
import { useEffect } from "react"
import WalletScreen from "@/features/wallet/pages/Wallet"

export default function WalletIndex() {
    const { expenseId } = useLocalSearchParams<{ expenseId?: string }>()
    const navigation = useNavigation()

    useEffect(() => {
        if (expenseId !== undefined && expenseId == null) {
            ;(navigation as any).navigate("create-expense", { expenseId: null })
        }
    }, [expenseId])

    return <WalletScreen />
}
