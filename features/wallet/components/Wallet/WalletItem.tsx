import moment from "moment"
import { Card } from "@/components"
import Colors from "@/constants/Colors"
import { memo, useMemo } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { AnimatedStyle } from "react-native-reanimated"
import { CategoryIcon, Icons } from "../Expense/ExpenseIcon"
import ContextMenu from "react-native-context-menu-view"
import { navigationRef } from "@/navigation/ref"
import useDeleteActivity from "../../hooks/useDeleteActivity"
import dayjs from "dayjs"

interface WalletElement {
    id: string
    amount: number
    description: string
    date: string
    type: string
    balanceBeforeInteraction?: number | null
    category?: string | null
    note?: string | null
    spontaneousRate?: number | null
    subAccountId?: string | null
    subscription?: unknown
    location?: unknown
    subexpenses?: unknown
    files?: unknown
    tags?: string | null
    shop?: string | null
}

export { Icons } from "../Expense/ExpenseIcon"

export { CategoryIcon } from "../Expense/ExpenseIcon"

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
    expense_item: {
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

    container: {
        marginBottom: 15,
        position: "relative",
    },
    innerContainer: { flexDirection: "row", height: 40 },

    descContainer: { height: "100%", justifyContent: "center", flex: 3 },
})

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function parseDateToText(date: string) {
    if (!date) return ""
    const m = moment(date)
    const dateStr = m.format("YYYY-MM-DD")
    const today = moment().format("YYYY-MM-DD")

    if (dateStr === today) return "Today"

    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD")
    if (dateStr === yesterday) return "Yesterday"

    const [year, month, day] = dateStr.split("-")
    return `${day} ${months[parseInt(month) - 1]} ${year}`
}

function dateFormatter(date: string) {
    if (!date) return ""
    const d = dayjs(date)
    const dateStr = d.format("YYYY-MM-DD")
    const today = dayjs().format("YYYY-MM-DD")

    if (dateStr === today) return `Today at ${d.format("HH:mm")}`

    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD")
    if (dateStr === yesterday) return `Yesterday at ${d.format("HH:mm")}`

    const [year, month, day] = dateStr.split("-")

    return `${day} ${months[parseInt(month) - 1]} ${year}, ${d.format("HH:mm")}`
}

function WalletItem(
    item: WalletItemProps & {
        handlePress: Function
        animatedStyle?: AnimatedStyle
        containerStyle?: StyleProp<ViewStyle>
    },
) {
    const { deleteActivity } = useDeleteActivity()

    const price =
        item?.type === "expense"
            ? (item.amount * -1).toFixed(2)
            : (item.type === "refunded" ? "" : "+") + item.amount?.toFixed(2)

    const isBalanceEdit = item?.description?.includes("Balance edited") || item?.amount === 0

    const items = useMemo(
        () => [
            {
                systemIcon: "pencil",
                title: "Edit",
                onPress: () => {
                    console.log("Editing item:", item)
                    navigationRef.current?.navigate("WalletScreens", {
                        screen: "CreateExpense",
                        params: { ...(item as any), isEditing: true },
                    } as any)
                },
            },
            {
                systemIcon: "clipboard",
                title: "Duplicate",
                onPress: () => {
                    navigationRef.current?.navigate("WalletScreens", {
                        screen: "CreateExpense",
                        params: { ...(item as any), isDuplicating: true },
                    } as any)
                },
            },
            {
                systemIcon: "trash",
                title: "Delete",
                destructive: true,
                onPress: () => {
                    deleteActivity({ variables: { id: item.id } })
                },
            },
        ],
        [item],
    )

    if (!item) {
        return null
    }

    return (
        <ContextMenu
            actions={items}
            onPress={(e) => {
                const action = items[e.nativeEvent.index] as (typeof items)[number]
                if (action && action.onPress) {
                    action.onPress()
                }
            }}
            previewBackgroundColor="transparent"
        >
            <Card
                style={[styles.container, item.animatedStyle as any, item.containerStyle]}
                ripple
                disabled={isBalanceEdit}
                onPress={() => item.handlePress()}
            >
                <View style={styles.innerContainer}>
                    <CategoryIcon
                        style={{ padding: 0 }}
                        type={item.type as "income" | "expense" | "refunded"}
                        category={(isBalanceEdit ? "edit" : item.category) as keyof typeof Icons}
                    />

                    <View style={styles.descContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.description}
                        </Text>

                        <Text style={styles.date}>
                            {dateFormatter(item.date)}
                            {item.category && (item.subscription as any)?.isActive && " • "}
                            {(item.subscription as any)?.isActive ? <Text>Subscription</Text> : ""}
                            {(item.files as any) && (item.files as any).length > 0 && (
                                <>
                                    {" • "}

                                    <Text>
                                        {(item.files as any).length} {(item.files as any).length > 1 ? "files" : "file"}
                                    </Text>
                                </>
                            )}
                            {(item.subexpenses as any) && (item.subexpenses as any)?.length > 0 && (
                                <>
                                    {" • "}
                                    <Text>{(item.subexpenses as any)?.length} items</Text>
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
