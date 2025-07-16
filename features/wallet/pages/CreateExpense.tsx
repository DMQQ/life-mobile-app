import Button from "@/components/ui/Button/Button"
import IconButton from "@/components/ui/IconButton/IconButton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import OptionsPicker from "@/features/wallet/components/CreateExpense/OptionsPicker"
import useCreateExpensePage from "@/features/wallet/hooks/useCreateExpensePage"
import { AntDesign } from "@expo/vector-icons"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import moment from "moment"
import { useCallback, useRef, useState } from "react"
import { Alert, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import DateTimePicker from "react-native-modal-datetime-picker"
import Animated, { FadeIn, interpolate, useAnimatedStyle } from "react-native-reanimated"
import CategorySelector from "../components/CreateExpense/CategorySelectorView"
import ExpenseAIMaker from "../components/CreateExpense/ExpenseAIMaker"
import NameInput from "../components/CreateExpense/NameInput"
import NumbersPad from "../components/CreateExpense/NumberPad"
import PredictionView from "../components/CreateExpense/PredictionView"
import { SpontaneousRateSelector } from "../components/CreateExpense/SpontaneousRate"
import WalletItem, { Icons } from "../components/Wallet/WalletItem"

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
    const {
        setExpense,
        handleToggleSubExpenseMode,
        handleSubmit,
        handleAmountChange,
        amount,
        prediction,
        applyPrediction,
        SubExpenses,
        calculateSubExpensesTotal,
        transformX,
        name,
        setName,
        isSubExpenseMode,
        type,
        date,
        setDate,
        changeView,
        isValid,
        loading,
        canPredict,
        category,
        setType,
        setChangeView,
        setIsSubExpenseMode,
        setSpontaneousRate,
        spontaneousRate,
        setSubExpenses,
        setIsSubscription,
        setCategory,
    } = useCreateExpensePage(params)

    const [spontaneousView, setSpontaneousView] = useState(false)

    const [isInputFocused, setIsInputFocused] = useState(false)

    const animatedAmount = useAnimatedStyle(
        () => ({
            transform: [{ translateX: transformX.value }],

            fontSize: interpolate(amount.length, [0, 1, 2, 3, 4, 10], [90, 80, 70, 60, 50, 40], "clamp"),
        }),
        [amount],
    )

    const subexpenseSheetRef = useRef<BottomSheet>(null)

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
        [],
    )

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ flex: 1 }}>
                <View style={styles.container}>
                    {prediction && <PredictionView applyPrediction={applyPrediction} {...prediction} />}

                    <IconButton
                        style={{ position: "absolute", top: 15, left: 15, zIndex: 100 }}
                        onPress={() => navigation.goBack()}
                        icon={<AntDesign name="close" size={24} color="rgba(255,255,255,0.7)" />}
                    />

                    <ExpenseAIMaker setExpense={setExpense} initialOpen={params?.shouldOpenPhotoPicker || false} />

                    <View style={styles.amountContainer}>
                        <View>
                            <Animated.Text style={[{ color: "#fff", fontWeight: "bold" }, animatedAmount]}>
                                {amount}
                                <Text style={{ fontSize: 20 }}>zł</Text>
                            </Animated.Text>

                            {SubExpenses.length > 0 && (
                                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center" }}>
                                    {SubExpenses.length} subexpenses for ~{calculateSubExpensesTotal().toFixed(2)}zł
                                </Text>
                            )}
                        </View>

                        {moment(date).isAfter(moment()) && type && amount != "0" && (
                            <View style={styles.scheduledContainer}>
                                <Text style={styles.scheduledText}>
                                    {capitalize(type || "")} of {amount}zł will be scheduled for {"\n"}{" "}
                                    {moment(date).format("DD MMMM YYYY")}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ marginTop: 20, flex: 1, gap: 15, maxHeight: Layout.screen.height / 1.75 - 5 }}>
                        <View
                            style={{
                                borderRadius: 35,
                                flex: 1,
                            }}
                        >
                            {!changeView && !spontaneousView && (
                                <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                                    <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
                                        <NameInput
                                            isInputFocused={isInputFocused}
                                            name={name}
                                            setIsInputFocused={setIsInputFocused}
                                            setName={setName}
                                            isSubExpenseMode={isSubExpenseMode}
                                            handleToggleSubExpenseMode={handleToggleSubExpenseMode}
                                            subexpenseSheetRef={subexpenseSheetRef}
                                            loading={loading}
                                            isValid={isValid}
                                            prediction={prediction}
                                            canPredict={!!canPredict}
                                            applyPrediction={applyPrediction}
                                            handleSubmit={handleSubmit}
                                            params={params}
                                        />
                                    </View>
                                    <OptionsPicker
                                        type={type}
                                        setType={setType}
                                        category={category}
                                        setCategory={setCategory}
                                        setChangeView={setChangeView}
                                        setSpontaneousView={setSpontaneousView}
                                        spontaneousRate={spontaneousRate}
                                        setDate={setDate}
                                        date={date}
                                    />
                                </Animated.View>
                            )}

                            {changeView && !spontaneousView && (
                                <CategorySelector
                                    dismiss={() => {
                                        setChangeView(false)
                                        setCategory("none")
                                    }}
                                    current={category}
                                    onPress={(item) => {
                                        setIsSubscription(item === "subscription")

                                        setCategory(item as keyof typeof Icons)
                                        setChangeView(false)
                                    }}
                                />
                            )}

                            {spontaneousView && (
                                <SpontaneousRateSelector
                                    value={spontaneousRate}
                                    setValue={setSpontaneousRate}
                                    dismiss={() => setSpontaneousView(false)}
                                />
                            )}

                            {!changeView && !spontaneousView && (
                                <NumbersPad
                                    rotateBackButton={amount === "0" && SubExpenses.length === 0}
                                    handleAmountChange={handleAmountChange}
                                />
                            )}
                        </View>
                    </View>
                </View>

                <BottomSheet
                    ref={subexpenseSheetRef}
                    index={-1}
                    snapPoints={[Layout.screen.height / 1.6]}
                    enablePanDownToClose
                    backdropComponent={renderBackdrop}
                    backgroundStyle={{ backgroundColor: Colors.primary }}
                    handleIndicatorStyle={{ backgroundColor: Colors.secondary }}
                >
                    <View style={{ flex: 1, padding: 15 }}>
                        <FlatList
                            data={SubExpenses}
                            showsHorizontalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={{ flex: 1 }}>
                                    <View
                                        style={{
                                            height: Layout.screen.height / 1.6 - 130,
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "rgba(255,255,255,0.7)",
                                                fontSize: 18,
                                                textAlign: "center",
                                                padding: 15,
                                            }}
                                        >
                                            No subexpenses added yet.{"\n"}Press the button below to add one.
                                        </Text>
                                    </View>

                                    <Button
                                        onPress={() => {
                                            subexpenseSheetRef.current?.close()
                                            setIsSubExpenseMode(true)
                                        }}
                                        style={{
                                            borderRadius: 100,
                                        }}
                                    >
                                        Add Subexpense
                                    </Button>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <WalletItem
                                    handlePress={() => {
                                        Alert.alert("Delete", "Are you sure you want to delete this subexpense?", [
                                            {
                                                text: "Cancel",
                                                style: "cancel",
                                            },
                                            {
                                                text: "Delete",
                                                onPress: () => {
                                                    setSubExpenses((prev) => prev.filter((i) => i.id !== item.id))
                                                },
                                            },
                                        ])
                                    }}
                                    {...({
                                        ...item,
                                        amount: item.amount.toString(),
                                        date: moment(date).format("YYYY-MM-DD"),
                                        type: "expense",
                                        category: item.category,
                                    } as any)}
                                    files={[]}
                                    subexpenses={[]}
                                    containerStyle={{ backgroundColor: Colors.primary_lighter }}
                                />
                            )}
                        />
                    </View>
                </BottomSheet>

                <DateTimePicker
                    isVisible={date == null}
                    onConfirm={(date) => {
                        setDate(moment(date).format("YYYY-MM-DD"))
                    }}
                    onCancel={() => setDate(moment().format("YYYY-MM-DD"))}
                />
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, gap: 15 },

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

    amountContainer: {
        height: 250,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 30,
        paddingHorizontal: 15,
    },

    scheduledContainer: { position: "absolute", justifyContent: "center", alignItems: "center", bottom: -15 },

    scheduledText: { color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: 13, textAlign: "center" },
})
