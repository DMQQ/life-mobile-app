import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Expense } from "@/types"
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList } from "@gorhom/bottom-sheet"
import Color from "color"
import { forwardRef, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import WalletItem from "../Wallet/WalletItem"
import { CategoryUtils } from "../Expense/ExpenseIcon"
import Layout from "@/constants/Layout"

interface Props {
    expenses: Expense[]
    categoryName: string
    categoryColor: string
    onExpensePress: (expense: Expense) => void
}

const CategoryExpensesSheet = forwardRef<BottomSheet, Props>(
    ({ expenses, categoryName, categoryColor, onExpensePress }, ref) => {
        const total = expenses.reduce((sum, e) => sum + e.amount, 0)
        const displayName = CategoryUtils.getCategoryName(categoryName) || "All"

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={["50%"]}
                enablePanDownToClose
                handleIndicatorStyle={{ backgroundColor: "#fff", width: 120 }}
                backgroundStyle={styles.background}
            >
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={[styles.dot, { backgroundColor: categoryColor }]} />
                        <Text
                            variant="subheading"
                            style={{ color: Colors.foreground, fontWeight: "bold", textTransform: "capitalize" }}
                        >
                            {displayName}
                        </Text>
                    </View>
                    <Text variant="caption" style={{ color: Colors.foreground_secondary }}>
                        {expenses.length} transactions · {total.toFixed(2)}zł
                    </Text>
                </View>

                <BottomSheetFlatList
                    data={expenses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <WalletItem
                            {...item}
                            handlePress={() => onExpensePress(item)}
                            containerStyle={{ backgroundColor: Colors.primary_lighter }}
                        />
                    )}
                />
            </BottomSheet>
        )
    },
)

export default CategoryExpensesSheet

const styles = StyleSheet.create({
    background: {
        backgroundColor: Colors.primary_light,
        borderWidth: 1,
        borderColor: Color(Colors.primary_light).lighten(0.4).hex(),
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 4,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 100,
    },
    list: {
        paddingHorizontal: 15,
        paddingBottom: Layout.screen.height * 0.1,
    },
})
