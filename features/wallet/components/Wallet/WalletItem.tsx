import moment from "moment"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { Card } from "@/components"
import Colors from "@/constants/Colors"
import { memo, useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Text from "@/components/ui/Text/Text"
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
    },
    price_container: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    expanded: {
        padding: 0,
        borderRadius: 20,
        marginTop: 15,
        paddingHorizontal: 15,
    },

    container: {
        position: "relative",
        borderWidth: 0,
        marginBottom: 0,
        borderRadius: 0,
        borderBottomWidth: 1,
        marginTop: 0,
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
            ? formatAmount(item.amount * -1)
            : (item.type === "refunded" ? "" : "+") + formatAmount(item.amount)

    const isBalanceEdit = item?.description?.includes("Balance edited") || item?.amount === 0

    const items = useMemo(
        () => [
            {
                systemIcon: "pencil",
                title: "Edit",
                onPress: () => {
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
                        <Text
                            size={14}
                            weight="bold"
                            color={Colors.foreground}
                            style={{ marginLeft: 10, marginBottom: 5 }}
                            numberOfLines={1}
                        >
                            {item.description}
                        </Text>

                        <Text
                            size={10}
                            weight="500"
                            color="rgba(255,255,255,0.65)"
                            lineHeight={16}
                            style={{ marginLeft: 10 }}
                        >
                            {dateFormatter(item.date)}
                            {item.category && (item.subscription as any)?.isActive && " • "}
                            {(item.subscription as any)?.isActive ? (
                                <Text size={10} color="rgba(255,255,255,0.65)">
                                    Subscription
                                </Text>
                            ) : (
                                ""
                            )}
                            {(item.files as any) && (item.files as any).length > 0 && (
                                <>
                                    {" • "}
                                    <Text size={10} color="rgba(255,255,255,0.65)">
                                        {(item.files as any).length} {(item.files as any).length > 1 ? "files" : "file"}
                                    </Text>
                                </>
                            )}
                            {(item.subexpenses as any) && (item.subexpenses as any)?.length > 0 && (
                                <>
                                    {" • "}
                                    <Text size={10} color="rgba(255,255,255,0.65)">
                                        {(item.subexpenses as any)?.length} items
                                    </Text>
                                </>
                            )}
                        </Text>
                    </View>
                    {!isBalanceEdit && (
                        <View style={[styles.price_container, { flexDirection: "row" }]}>
                            <Text
                                size={16}
                                weight="600"
                                align="right"
                                mono
                                strikethrough={item.type === "refunded"}
                                color={
                                    item.type === "refunded"
                                        ? Colors.secondary_light_2
                                        : item.type === "expense"
                                          ? "#F07070"
                                          : "#66E875"
                                }
                                style={{ width: "100%" }}
                            >
                                {price}
                                <Text
                                    size={12}
                                    color={
                                        item.type === "refunded"
                                            ? Colors.secondary_light_2
                                            : item.type === "expense"
                                              ? "#F07070"
                                              : "#66E875"
                                    }
                                >
                                    zł
                                </Text>
                            </Text>
                        </View>
                    )}
                </View>
            </Card>
        </ContextMenu>
    )
}

export default memo(WalletItem)
