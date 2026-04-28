import IconButton from "@/components/ui/IconButton/IconButton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import { AntDesign } from "@expo/vector-icons"
import moment from "moment"
import { useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import DateTimePicker from "react-native-modal-datetime-picker"
import Animated, { FadeIn } from "react-native-reanimated"
import AmountDisplay from "../components/CreateExpense/AmountDisplay"
import CategorySelector from "../components/CreateExpense/CategorySelectorView"
import ExpenseAIMaker from "../components/CreateExpense/ExpenseAIMaker"
import NameInput from "../components/CreateExpense/NameInput"
import ExpenseNumberPad from "../components/CreateExpense/ExpenseNumberPad"
import OptionsPicker from "../components/CreateExpense/OptionsPicker"
import PredictionView from "../components/CreateExpense/PredictionView"
import { SpontaneousRateSelector } from "../components/CreateExpense/SpontaneousRate"
import SubExpenseSheet from "../components/CreateExpense/SubexpenseSheet"
import GlassView from "@/components/ui/GlassView"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { CreateExpenseProvider, CreateExpenseContextType } from "../context/CreateExpenseContext"

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

    return (
        <CreateExpenseProvider value={contextValue}>
            <View style={{ flex: 1 }}>
                <View style={styles.container}>
                    {state.prediction && <PredictionView />}

                    <GlassView style={styles.cameraIcon}>
                        <IconButton
                            onPress={() => navigation.goBack()}
                            icon={<AntDesign name="close" size={20} color="#fff" />}
                        />
                    </GlassView>

                    <ExpenseAIMaker initialOpen={params?.shouldOpenPhotoPicker || false} />

                    <AmountDisplay />

                    <View style={styles.contentContainer}>
                        <View style={{ borderRadius: 35, flex: 1 }}>
                            {state.view === "main" && (
                                <>
                                    <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                width: "100%",
                                                alignItems: "center",
                                                zIndex: 1000,
                                            }}
                                        >
                                            <NameInput isEditing={params?.isEditing} />
                                        </View>
                                        <OptionsPicker />
                                    </Animated.View>
                                    <ExpenseNumberPad />
                                </>
                            )}

                            {state.view === "category" && <CategorySelector />}

                            {state.view === "spontaneous" && <SpontaneousRateSelector />}
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
