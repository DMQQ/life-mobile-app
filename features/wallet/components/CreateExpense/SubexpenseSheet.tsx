import { Button } from "@/components"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import moment from "moment"
import React, { forwardRef, useCallback } from "react"
import { Alert, StyleProp, Text, View, ViewStyle } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import WalletItem from "../Wallet/WalletItem"

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
}

const SubExpenseSheet = forwardRef<
    BottomSheetMethods,
    SubExpenseSheetProps
>(({ setIsSubExpenseMode, setSubExpenses, SubExpenses, date }, subexpenseSheetRef) => {
    const renderBackdrop = useCallback(
        (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        ),
        [],
    )
    return (
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
                                    if (subexpenseSheetRef && 'current' in subexpenseSheetRef && subexpenseSheetRef.current) {
                                        subexpenseSheetRef.current.snapToIndex(0)
                                    }
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
            </View>
        </BottomSheet>
    )
})

export default SubExpenseSheet
