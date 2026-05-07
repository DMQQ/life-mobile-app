import Colors from "@/constants/Colors"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
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
import { Icons } from "../components/Expense/ExpenseIcon"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"
import IconBackButton from "@/components/ui/Button/IconBackButton"
import NumberPad from "@/components/ui/NumberPad"
import CategorySelector from "../components/CreateExpense/CategorySelectorView"
import { SpontaneousRateSelector } from "../components/CreateExpense/SpontaneousRate"
import Animated, { FadeIn } from "react-native-reanimated"
import GroupSelector from "@/components/ui/GroupSelector"
import { useSubAccounts } from "../hooks/useSubAccounts"
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons"
import Color from "color"
import Ripple from "react-native-material-ripple"
import Feedback from "react-native-haptic-feedback"

const TYPE_OPTIONS: ["Expense", "Income", "Refund"] = ["Expense", "Income", "Refund"]

const labelToType = (label: string): "expense" | "income" | "refunded" =>
    label === "Expense" ? "expense" : label === "Income" ? "income" : "refunded"

const typeToLabel = (type: string | null): "Expense" | "Income" | "Refund" =>
    type === "income" ? "Income" : type === "refunded" ? "Refund" : "Expense"

export default function CreateExpenseModal({ route: { params } }: any) {
    const hookData = useCreateExpensePage(params)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const subexpenseSheetRef = useRef<BottomSheetModalMethods | null>(null)

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
                        onChange={(label) => methods.setType(labelToType(label))}
                    />
                </View>

                {state.prediction && !params.isEditing && <PredictionView />}

                <SaveButton />

                <AmountDisplay />

                <View style={styles.card}>
                    <CardContent params={params} />
                </View>

                {typeof state.date !== "string" && (
                    <DateTimePicker
                        display="inline"
                        mode="date"
                        themeVariant="dark"
                        accentColor={Colors.secondary}
                        value={new Date()}
                        onChange={(_, date) => {
                            if (date) methods.setDate(moment(date).format("YYYY-MM-DD"))
                            else methods.setDate(moment().format("YYYY-MM-DD"))
                        }}
                    />
                )}

                <SubExpenseSheet />
            </View>
        </CreateExpenseProvider>
    )
}

function CardContent({ params }: { params: any }) {
    const { state, methods } = useCreateExpenseContext()
    const { view } = state

    if (view === "category") {
        return (
            <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                <CategorySelector
                    current={state.category}
                    onPress={(item) => {
                        methods.setCategory(item as keyof typeof Icons)
                        methods.setIsSubscription(item === "subscription")
                        methods.setType("expense")
                        methods.setView("main")
                    }}
                    dismiss={() => {
                        methods.setCategory("none")
                        methods.setView("main")
                    }}
                />
            </Animated.View>
        )
    }

    if (view === "spontaneous") {
        return (
            <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                <SpontaneousRateSelector onDismiss={() => methods.setView("main")} />
            </Animated.View>
        )
    }

    if (view === "account") {
        return (
            <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                <AccountSelector />
            </Animated.View>
        )
    }

    return (
        <Animated.View entering={FadeIn} style={{ flex: 1, gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                <ExpenseAIMaker initialOpen={params?.shouldOpenPhotoPicker || false} />
                <NameInput isEditing={params?.isEditing} />
            </View>

            <View>
                <OptionsPicker />
            </View>

            <View style={{ marginTop: 10, flex: 1 }}>
                <NumberPad onKeyPress={methods.handleAmountChange} />
            </View>
        </Animated.View>
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

function AccountSelector() {
    const { state, methods } = useCreateExpenseContext()
    const { subAccountId } = state
    const { setSubAccountId, setView } = methods
    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []

    const entries = [
        { id: null, name: "Default", icon: "credit-card-outline", color: "rgba(255,255,255,0.6)" },
        ...subAccounts,
    ]

    return (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {entries.map((item) => {
                const selected = subAccountId === item.id
                const bg = selected
                    ? Color(item.color || Colors.primary_lighter).alpha(0.2).string()
                    : Colors.primary_lighter
                return (
                    <Ripple
                        key={item.id ?? "__default"}
                        style={[accountStyles.tile, { backgroundColor: bg }]}
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setSubAccountId(item.id)
                            setTimeout(() => setView("main"), 200)
                        }}
                    >
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color ?? "rgba(255,255,255,0.6)"} />
                        <Text style={[accountStyles.tileLabel, { color: selected ? (item.color ?? "rgba(255,255,255,0.85)") : "rgba(255,255,255,0.85)" }]}>
                            {item.name}
                        </Text>
                        {selected && <AntDesign name="check" size={16} color={item.color ?? "rgba(255,255,255,0.6)"} />}
                    </Ripple>
                )
            })}
        </ScrollView>
    )
}

const accountStyles = StyleSheet.create({
    tile: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 16,
        borderRadius: 14,
        gap: 12,
        marginBottom: 8,
    },
    tileLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
    },
})

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
        height: "65%",
        left: 0,
        right: 0,
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
    },
})
