import IconButton from "@/components/ui/IconButton/IconButton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import OptionsPicker from "@/features/wallet/components/CreateExpense/OptionsPicker"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import { AntDesign } from "@expo/vector-icons"
import BottomSheet from "@gorhom/bottom-sheet"
import moment from "moment"
import { useCallback, useRef, useState } from "react"
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import DateTimePicker from "react-native-modal-datetime-picker"
import Animated, { FadeIn } from "react-native-reanimated"
import AmountDisplay from "../components/CreateExpense/AmountDisplay"
import CategorySelector from "../components/CreateExpense/CategorySelectorView"
import ExpenseAIMaker from "../components/CreateExpense/ExpenseAIMaker"
import NameInput from "../components/CreateExpense/NameInput"
import NumbersPad from "../components/CreateExpense/NumberPad"
import PredictionView from "../components/CreateExpense/PredictionView"
import { SpontaneousRateSelector } from "../components/CreateExpense/SpontaneousRate"
import SubExpenseSheet from "../components/CreateExpense/SubexpenseSheet"
import { Icons } from "../components/Wallet/WalletItem"
import GlassView from "@/components/ui/GlassView"

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
    const { state, methods, animated } = useCreateExpensePage(params)

    const [spontaneousView, setSpontaneousView] = useState(false)

    const [isInputFocused, setIsInputFocused] = useState(false)

    const subexpenseSheetRef = useRef<BottomSheet>(null)

    const onPressCategorySelector = useCallback((item: string) => {
        methods.setIsSubscription(item === "subscription")

        methods.setCategory(item as keyof typeof Icons)
        methods.setChangeView(false)
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <>
                    <View style={{ flex: 1 }}>
                        <View style={styles.container}>
                            {state.prediction && (
                                <PredictionView applyPrediction={methods.applyPrediction} {...state.prediction} />
                            )}

                            <GlassView style={styles.cameraIcon}>
                                <IconButton
                                    onPress={() => navigation.goBack()}
                                    icon={<AntDesign name="close" size={20} color="rgba(255,255,255,0.7)" />}
                                />
                            </GlassView>

                            <ExpenseAIMaker
                                setExpense={methods.setExpense}
                                initialOpen={params?.shouldOpenPhotoPicker || false}
                            />

                            <AmountDisplay
                                type={state.type || ""}
                                amount={state.amount}
                                subExpensesLength={state.SubExpenses.length}
                                date={state.date || ""}
                                calculateSubExpensesTotal={methods.calculateSubExpensesTotal}
                                transformX={animated.transformX}
                            />

                            <View style={styles.contentContainer}>
                                <View
                                    style={{
                                        borderRadius: 35,
                                        flex: 1,
                                    }}
                                >
                                    {!state.changeView && !spontaneousView && (
                                        <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                                            <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
                                                <NameInput
                                                    {...state}
                                                    {...methods}
                                                    subExpensesLength={state.SubExpenses.length}
                                                    canPredict={!!state.canPredict}
                                                    isInputFocused={isInputFocused}
                                                    setIsInputFocused={setIsInputFocused}
                                                    subexpenseSheetRef={subexpenseSheetRef}
                                                    params={params}
                                                />
                                            </View>
                                            <OptionsPicker
                                                {...state}
                                                {...methods}
                                                setSpontaneousView={setSpontaneousView}
                                            />
                                        </Animated.View>
                                    )}

                                    {state.changeView && !spontaneousView && (
                                        <CategorySelector
                                            dismiss={() => {
                                                methods.setChangeView(false)
                                                methods.setCategory("none")
                                            }}
                                            current={state.category}
                                            onPress={onPressCategorySelector}
                                        />
                                    )}

                                    {spontaneousView && (
                                        <SpontaneousRateSelector
                                            value={state.spontaneousRate}
                                            setValue={methods.setSpontaneousRate}
                                            dismiss={() => setSpontaneousView(false)}
                                        />
                                    )}

                                    {!state.changeView && !spontaneousView && (
                                        <NumbersPad
                                            rotateBackButton={state.amount === "0" && state.SubExpenses.length === 0}
                                            handleAmountChange={methods.handleAmountChange}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>

                        <SubExpenseSheet
                            ref={subexpenseSheetRef}
                            setSubExpenses={methods.setSubExpenses}
                            SubExpenses={state.SubExpenses}
                            setIsSubExpenseMode={methods.setIsSubExpenseMode}
                            date={state.date}
                        />
                    </View>
                    <DateTimePicker
                        isVisible={typeof state.date !== "string"}
                        onConfirm={(date) => {
                            methods.setDate(moment(date).format("YYYY-MM-DD"))
                        }}
                        onCancel={() => methods.setDate(moment().format("YYYY-MM-DD"))}
                    />
                </>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 15, justifyContent: "space-between" },

    numberPadNumberButton: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    categoryButton: {
        paddingVertical: 15,
        paddingHorizontal: 5.5,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
        flex: 1,
    },

    contentContainer: {
        padding: 15,
        flex: 1,
        gap: 15,
        maxHeight: Layout.screen.height / 1.65,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingBottom: 30,
    },

    cameraIcon: { position: "absolute", top: 15, left: 15, zIndex: 100, padding: 10, borderRadius: 100 },
})
