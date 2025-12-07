import { Card } from "@/components"
import Colors from "@/constants/Colors"
import { Expense } from "@/types"
import moment from "moment"
import { memo, useMemo } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { AnimatedStyle } from "react-native-reanimated"
import { CategoryIcon, Icons } from "../Expense/ExpenseIcon"
import ContextMenu from "@/components/ui/ContextMenu"
import { useNavigation } from "@react-navigation/native"
import useDeleteActivity from "../../hooks/useDeleteActivity"

interface WalletElement extends Expense {
    description: string
    amount: number
    type: string
    date: string
    id: string

    balanceBeforeInteraction: number

    category: keyof typeof Icons

    note?: string
}

export { Icons } from "../Expense/ExpenseIcon"

export { CategoryIcon } from "../Expense/ExpenseIcon"

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
    expense_item: {
        height: 60,
        flexDirection: "row",
        backgroundColor: Colors.primary_lighter,
    },
    title: {
        color: Colors.foreground,
        fontSize: 14,
        marginLeft: 10,
        fontWeight: "bold",
        marginBottom: 5,
        textTransform: "capitalize",
    },

    date: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 10,
        marginLeft: 10,
        lineHeight: 16,
        fontWeight: "500",
    },
    price_container: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    price: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "600",
    },

    buttonText: {
        color: Colors.secondary,
        fontSize: 20,
        fontWeight: "bold",
    },

    expanded: {
        padding: 0,
        borderRadius: 20,
        marginTop: 15,
        paddingHorizontal: 15,
    },
})

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function parseDateToText(date: string) {
    const dateStr = date.slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)

    if (dateStr === today) return "Today"

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (dateStr === yesterday) return "Yesterday"

    const [year, month, day] = dateStr.split("-")
    return `${day} ${months[parseInt(month) - 1]} ${year}`
}

function dateFormatter(date: string) {
    const dateStr = date.slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)

    if (dateStr === today) return "Today"

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (dateStr === yesterday) return "Yesterday"

    return moment(date).fromNow()
}

function WalletItem(
    item: WalletItemProps & {
        handlePress: Function
        animatedStyle: AnimatedStyle
        containerStyle?: StyleProp<ViewStyle>
    },
) {
    const { deleteActivity } = useDeleteActivity()

    const navigation = useNavigation<any>()
    const price =
        item?.type === "expense"
            ? (item.amount * -1).toFixed(2)
            : (item.type === "refunded" ? "" : "+") + item.amount?.toFixed(2)

    const isBalanceEdit = item?.description?.includes("Balance edited") || item?.amount === 0

    const items = useMemo(
        () => [
            {
                leading: "pencil",
                text: "Edit",
                onPress: () => {
                    navigation.navigate("CreateExpense", {
                        ...(item as any),
                        isEditing: true,
                    })
                },
            },
            // {
            //     leading: "arrow.trianglehead.clockwise.rotate.90",
            //     text: "Refund",
            //     onPress: () => {},
            // },
            {
                leading: "clipboard",
                text: "Duplicate",
                onPress: () => {
                    navigation.navigate("CreateExpense", {
                        ...(item as any),
                        isDuplicating: true,
                    })
                },
            },
            {
                leading: "trash",
                text: "Delete",
                destructive: true,
                onPress: () => deleteActivity({ variables: { id: item.id } }),
            },
        ],
        [item],
    )

    if (!item) {
        return null
    }

    return (
        <ContextMenu anchor="middle" items={items}>
            <Card
                style={[
                    {
                        marginBottom: 15,
                        position: "relative",
                    },
                    item.animatedStyle as any,
                    item.containerStyle,
                ]}
                ripple
                disabled={isBalanceEdit}
                onPress={() => item.handlePress()}
            >
                <View style={{ flexDirection: "row", height: 40 }}>
                    <CategoryIcon
                        style={{ padding: 0 }}
                        type={item.type as "income" | "expense" | "refunded"}
                        category={isBalanceEdit ? "edit" : item.category}
                    />

                    <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.description}
                        </Text>

                        <Text style={styles.date}>
                            {dateFormatter(item.date)}
                            {item.category && item.subscription?.isActive && " • "}
                            {item.subscription?.isActive ? <Text>Subscription</Text> : ""}
                            {item.files && item.files.length > 0 && (
                                <>
                                    {" • "}

                                    <Text>
                                        {item.files.length} {item.files.length > 1 ? "files" : "file"}
                                    </Text>
                                </>
                            )}
                            {item.subexpenses && item.subexpenses?.length > 0 && (
                                <>
                                    {" • "}
                                    <Text>{item.subexpenses?.length} items</Text>
                                </>
                            )}
                        </Text>
                    </View>
                    {!isBalanceEdit && (
                        <View style={[styles.price_container, { flexDirection: "row" }]}>
                            <Text
                                style={[
                                    styles.price,
                                    {
                                        marginRight: 10,
                                        width: "100%",
                                        textAlign: "right",
                                        color:
                                            item.type === "refunded"
                                                ? Colors.secondary_light_2
                                                : item.type === "expense"
                                                  ? "#F07070"
                                                  : "#66E875",
                                        ...(item.type === "refunded" ? { textDecorationLine: "line-through" } : {}),
                                    },
                                ]}
                            >
                                {price}
                                <Text style={{ fontSize: 12 }}>zł</Text>
                            </Text>
                        </View>
                    )}
                </View>
            </Card>
        </ContextMenu>
    )
}

export default memo(WalletItem)
