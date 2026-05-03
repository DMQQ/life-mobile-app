import GroupSelector from "@/components/ui/GroupSelector"
import Colors from "@/constants/Colors"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import DateTimePicker from "react-native-modal-datetime-picker"
import AmountDisplay from "../components/CreateExpense/AmountDisplay"
import ExpenseAIMaker from "../components/CreateExpense/ExpenseAIMaker"
import NameInput from "../components/CreateExpense/NameInput"
import OptionsPicker from "../components/CreateExpense/OptionsPicker"
import PredictionView from "../components/CreateExpense/PredictionView"
import SubExpenseSheet from "../components/CreateExpense/SubexpenseSheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    CreateExpenseProvider,
    CreateExpenseContextType,
    useCreateExpenseContext,
} from "../context/CreateExpenseContext"
import CompactNumberPad from "@/components/ui/CompactNumberPad"
import { Icons } from "../components/Expense/ExpenseIcon"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"
import IconBackButton from "@/components/ui/Button/IconBackButton"

const TYPE_OPTIONS: ["Expense", "Income", "Refund"] = ["Expense", "Income", "Refund"]

const labelToType = (label: string) => (label === "Expense" ? "expense" : label === "Income" ? "income" : "refunded")

const typeToLabel = (type: string | null): "Expense" | "Income" | "Refund" =>
    type === "income" ? "Income" : type === "refunded" ? "Refund" : "Expense"

export default function CreateExpenseModal({ route: { params } }: any) {
    const hookData = useCreateExpensePage(params)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const subexpenseSheetRef = useRef<BottomSheetModalMethods>(null)

    const contextValue: CreateExpenseContextType = {
        ...hookData,
        isInputFocused,
        setIsInputFocused,
        subexpenseSheetRef,
    }

    const { state, methods } = hookData

    useEffect(() => {
        if (!state.type) methods.setType("expense")
    }, [])

    return (
        <CreateExpenseProvider value={contextValue}>
            <View style={[styles.root]}>
                <IconBackButton style={styles.closeBtn} />

                <View style={{ position: "absolute", top: 15, left: 80, right: 80, zIndex: 1000 }}>
                    <GroupSelector
                        options={TYPE_OPTIONS}
                        value={typeToLabel(state.type)}
                        onChange={(label) => methods.setType(labelToType(label) as any)}
                    />
                </View>

                {state.prediction && !params.isEditing && <PredictionView />}

                <SaveButton />

                <AmountDisplay />

                <View style={styles.card}>
                    <View>
                        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                            <ExpenseAIMaker initialOpen={params?.shouldOpenPhotoPicker || false} />
                            <NameInput isEditing={params?.isEditing} />
                        </View>

                        <OptionsPicker />

                        <View style={{ marginTop: 10 }}>
                            <CompactNumberPad
                                onKeyPress={methods.handleAmountChange}
                                backgroundColor={Colors.primary_lighter}
                                fontVariant="body"
                                fontWeight="bold"
                            />
                        </View>
                    </View>
                </View>

                <DateTimePicker
                    isVisible={typeof state.date !== "string"}
                    onConfirm={(date) => methods.setDate(moment(date).format("YYYY-MM-DD"))}
                    onCancel={() => methods.setDate(moment().format("YYYY-MM-DD"))}
                />

                <SubExpenseSheet />
            </View>
        </CreateExpenseProvider>
    )
}

const SaveButton = () => {
    const { state, methods } = useCreateExpenseContext()
    const { isValid, prediction, canPredict, loading } = state
    const { applyPrediction, handleSubmit } = methods
    const disabled = !isValid && !prediction && !canPredict

    const tintColor =
        !isValid && prediction ? Icons[prediction.category as keyof typeof Icons]?.backgroundColor : undefined

    return (
        <IconSaveButton
            disabled={disabled || loading}
            onPress={!isValid && prediction ? applyPrediction : handleSubmit}
            loading={loading}
            tintColor={tintColor}
        />
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    card: {
        padding: 15,
        gap: 10,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingBottom: 30,
        position: "absolute",
        bottom: 0,
        height: "70%",
        left: 0,
        right: 0,
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
    },
    saveButton: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 100,
        padding: 10,
        borderRadius: 100,
    },
})
