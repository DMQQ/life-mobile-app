import { Button, EmptyState, ConfirmDialog } from "@/components"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import BottomSheetModal, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetView,
} from "@gorhom/bottom-sheet"
import moment from "moment"
import React, { useCallback, useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import WalletItem from "../Wallet/WalletItem"
import Color from "color"
import { useCreateExpenseContext, SubExpense } from "@/features/wallet/context/CreateExpenseContext"

const SubExpenseSheet = () => {
    const { state, methods, subexpenseSheetRef } = useCreateExpenseContext()
    const { SubExpenses, date } = state
    const { setIsSubExpenseMode, setSubExpenses } = methods
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const backdropComponent = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={"close"} />
        ),
        [],
    )

    return (
        <>
            <BottomSheetModal
                ref={subexpenseSheetRef}
                index={-1}
                snapPoints={[Layout.screen.height / 2]}
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
                            <EmptyState
                                icon="file-text"
                                title="No subexpenses yet"
                                description="Add subexpenses to break down your expenses"
                                actionLabel="Add Subexpense"
                                onAction={() => {
                                    setIsSubExpenseMode(true)
                                    subexpenseSheetRef.current?.collapse()
                                }}
                            />
                        }
                        renderItem={({ item }: { item: SubExpense }) => (
                            <WalletItem
                                handlePress={() => setConfirmDeleteId(item.id)}
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
                                containerStyle={{ backgroundColor: Colors.primary_lighter } as StyleProp<ViewStyle>}
                            />
                        )}
                    />
                </BottomSheetView>
            </BottomSheetModal>

            <ConfirmDialog
                isVisible={!!confirmDeleteId}
                onDismiss={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    setSubExpenses((prev) => prev.filter((i) => i.id !== confirmDeleteId))
                    setConfirmDeleteId(null)
                }}
                title="Delete Subexpense"
                description="Are you sure you want to delete this subexpense?"
                destructive
            />
        </>
    )
}

export default SubExpenseSheet
