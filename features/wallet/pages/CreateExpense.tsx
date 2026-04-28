import IconButton from "@/components/ui/IconButton/IconButton"
import GroupSelector from "@/components/ui/GroupSelector"
import Colors from "@/constants/Colors"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import { AntDesign } from "@expo/vector-icons"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import DateTimePicker from "react-native-modal-datetime-picker"
import AmountDisplay from "../components/CreateExpense/AmountDisplay"
import ExpenseAIMaker from "../components/CreateExpense/ExpenseAIMaker"
import NameInput from "../components/CreateExpense/NameInput"
import OptionsPicker from "../components/CreateExpense/OptionsPicker"
import PredictionView from "../components/CreateExpense/PredictionView"
import SubExpenseSheet from "../components/CreateExpense/SubexpenseSheet"
import GlassView from "@/components/ui/GlassView"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    CreateExpenseProvider,
    CreateExpenseContextType,
    useCreateExpenseContext,
} from "../context/CreateExpenseContext"
import CompactNumberPad from "@/components/ui/CompactNumberPad"
import Button from "@/components/ui/Button/Button2"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icons } from "../components/Expense/ExpenseIcon"

const TYPE_OPTIONS: ["Expense", "Income", "Refund"] = ["Expense", "Income", "Refund"]

const labelToType = (label: string) => (label === "Expense" ? "expense" : label === "Income" ? "income" : "refunded")

const typeToLabel = (type: string | null): "Expense" | "Income" | "Refund" =>
    type === "income" ? "Income" : type === "refunded" ? "Refund" : "Expense"

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
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
                {state.prediction && <PredictionView />}

                <GlassView style={styles.closeBtn}>
                    <IconButton
                        onPress={() => navigation.goBack()}
                        icon={<AntDesign name="close" size={20} color="#fff" />}
                    />
                </GlassView>

                <SaveButton />

                <AmountDisplay />

                <View style={styles.card}>
                    <View>
                        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                            <ExpenseAIMaker initialOpen={params?.shouldOpenPhotoPicker || false} />
                            <NameInput isEditing={params?.isEditing} />
                        </View>

                        <View style={{ marginBottom: 10 }}>
                            <GroupSelector
                                options={TYPE_OPTIONS}
                                value={typeToLabel(state.type)}
                                onChange={(label) => methods.setType(labelToType(label) as any)}
                            />
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
        !isValid && prediction
            ? Icons[prediction.category as keyof typeof Icons]?.backgroundColor
            : !isValid
              ? Colors.primary
              : Colors.secondary

    return (
        <GlassView key={tintColor} tintColor={tintColor} style={styles.saveButton}>
            <IconButton
                disabled={disabled || loading}
                onPress={!isValid && prediction ? applyPrediction : handleSubmit}
                icon={
                    loading ? (
                        <ActivityIndicator size={20} color="#fff" />
                    ) : (
                        <AntDesign name="check" size={20} color="#fff" />
                    )
                }
            />
        </GlassView>
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
        maxHeight: "77.5%",
        position: "absolute",
        bottom: 0,

        left: 0,
        right: 0,
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
        padding: 10,
        borderRadius: 100,
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
