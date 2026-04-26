import { Button } from "@/components"
import Colors, { Sizing } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import moment from "moment"
import React, { useCallback } from "react"
import { Alert, StyleProp, Text, View, ViewStyle } from "react-native"
import WalletItem from "../Wallet/WalletItem"
import Color from "color"
import { MaterialIcons } from "@expo/vector-icons"

interface SubExpense {
    id: string
    amount: number
    description: string
    category: keyof typeof Icons
}

interface SubExpenseSheetProps {
    setIsSubExpenseMode: React.Dispatch<React.SetStateAction<boolean>>
    setSubExpenses: React.Dispatch<React.SetStateAction<SubExpense[]>>
    SubExpenses: SubExpense[]
    date: string | null

    ref: React.RefObject<BottomSheetModalMethods>
}

const SubExpenseSheet = ({
    setIsSubExpenseMode,
    setSubExpenses,
    SubExpenses,
    date,
    ref: subexpenseSheetRef,
}: SubExpenseSheetProps) => {
    const backdropComponent = useCallback((props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} />, [])
    return (
        <BottomSheetModal
            ref={subexpenseSheetRef}
            index={0}
            snapPoints={[50, Layout.screen.height / 2]}
            animateOnMount={false}
            handleIndicatorStyle={{ backgroundColor: "#fff", width: 120 }}
            backgroundStyle={{
                backgroundColor: Colors.primary_lighter,
                borderWidth: 1,
                borderColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
            }}
            backdropComponent={backdropComponent}
        >
            <BottomSheetView style={{ flex: 1, padding: 15 }}>
                <BottomSheetFlatList
                    data={SubExpenses}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
                            <MaterialIcons
                                name="receipt-long"
                                size={56}
                                color={Colors.foreground_secondary}
                                style={{ marginBottom: 20 }}
                            />
                            <Text
                                style={{
                                    color: Colors.text_light,
                                    fontSize: Sizing.heading,
                                    fontWeight: "700",
                                    textAlign: "left",
                                    marginBottom: 12,
                                }}
                            >
                                No subexpenses yet
                            </Text>
                            <Text
                                style={{
                                    color: Colors.foreground_secondary,
                                    fontSize: Sizing.text,
                                    textAlign: "left",
                                    marginBottom: 32,
                                }}
                            >
                                Add subexpenses to break down your expenses
                            </Text>
                            <Button
                                onPress={() => {
                                    setIsSubExpenseMode(true)
                                }}
                                style={{
                                    borderRadius: 12,
                                    backgroundColor: Colors.secondary,
                                    shadowOpacity: 0,
                                    elevation: 0,
                                }}
                            >
                                Add Subexpense
                            </Button>
                        </View>
                    }
                    renderItem={({ item, index }: { item: SubExpense; index: number }) => (
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
                            id={item.id}
                            amount={item.amount}
                            description={item.description}
                            date={moment(date).format("YYYY-MM-DD")}
                            type="expense"
                            category={item.category}
                            balanceBeforeInteraction={0}
                            spontaneousRate={0}
                            subscription={null}
                            location={null}
                            subexpenses={[]}
                            files={[]}
                            animatedStyle={{} as any}
                            index={index}
                            containerStyle={{ backgroundColor: Colors.primary_lighter } as StyleProp<ViewStyle>}
                        />
                    )}
                />
            </BottomSheetView>
        </BottomSheetModal>
    )
}

export default SubExpenseSheet
