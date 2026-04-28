import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import { useNavigation } from "@react-navigation/native"
import NumberPad from "@/components/ui/NumberPad"

export default function ExpenseNumberPad() {
    const { state, methods } = useCreateExpenseContext()
    const navigation = useNavigation()
    const isZero = state.amount === "0" && state.SubExpenses.length === 0

    return (
        <NumberPad
            onKeyPress={methods.handleAmountChange}
            onBackPress={isZero ? () => navigation.goBack() : undefined}
        />
    )
}
