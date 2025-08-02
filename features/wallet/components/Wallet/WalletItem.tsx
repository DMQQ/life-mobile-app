import { Card } from "@/components"
import Colors from "@/constants/Colors"
import { Expense } from "@/types"
import moment from "moment"
import { useState } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { AnimatedStyle, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import { CategoryIcon, Icons } from "../Expense/ExpenseIcon"

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
    icon_container: {
        padding: 7.5,
        justifyContent: "center",
    },
    date: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 11,
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
    button: {
        padding: 5,
        paddingHorizontal: 7.5,
        backgroundColor: Colors.primary_light,
    },
    buttonText: {
        color: Colors.secondary,
        fontSize: 20,
        fontWeight: "bold",
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
        height: 40,
        width: 40,
    },
    expanded: {
        padding: 15,
        borderRadius: 20,
        paddingTop: 20,
    },
})

export function parseDateToText(date: string) {
    const providedDate = moment(date)
    const today = moment()

    if (providedDate.isSame(today, "day")) {
        return "Today"
    }
    if (providedDate.isSame(today.clone().subtract(1, "days"), "day")) {
        return "Yesterday"
    }

    return moment(date).format("DD MMM YYYY")
}

function dateFormatter(date: string) {
    const providedDate = moment(date)
    const today = moment()

    if (providedDate.isSame(today, "day")) {
        return "Today"
    }
    if (providedDate.isSame(today.clone().subtract(1, "days"), "day")) {
        return "Yesterday"
    }

    return moment(date).fromNow()
}

export default function WalletItem(
    item: WalletItemProps & {
        handlePress: Function
        animatedStyle: AnimatedStyle
        index: number
        containerStyle?: StyleProp<ViewStyle>
        subExpenseStyle?: StyleProp<ViewStyle> & Record<string, any>
        onLongPress?: () => void
    },
) {
    const price =
        item?.type === "expense"
            ? (item.amount * -1).toFixed(2)
            : (item.type === "refunded" ? "" : "+") + item.amount?.toFixed(2)

    const isBalanceEdit = item?.description?.includes("Balance edited") || item?.amount === 0

    const [isExpanded, setIsExpanded] = useState(false)

    if (!item) {
        return null
    }

    return (
        <Card
            animated
            style={[
                {
                    marginBottom: 15,
                    position: "relative",
                },
                item.animatedStyle as any,
                item.containerStyle,
            ]}
            layout={LinearTransition}
        >
            <Ripple
                onLongPress={async () => {
                    Feedback.trigger("impactLight")
                    if (item.onLongPress) {
                        item.onLongPress()
                    }
                    setIsExpanded(!isExpanded)
                }}
                disabled={isBalanceEdit}
                style={[styles.expense_item]}
                onPress={() => item.handlePress()}
            >
                <CategoryIcon
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
            </Ripple>

            {isExpanded && item.subexpenses?.length > 0 && (
                <Animated.View layout={LinearTransition} style={styles.expanded}>
                    {item.subexpenses.map((subexpense, index) => (
                        <Animated.View
                            key={subexpense.id}
                            entering={FadeIn.delay(index * 50)}
                            exiting={FadeOut.delay(Math.min((item.subexpenses.length - index) * 50, 200))}
                        >
                            <WalletItem
                                key={index}
                                {...item}
                                {...(subexpense as any)}
                                files={[]}
                                subscription={undefined}
                                subexpenses={[]}
                                type="expense"
                                handlePress={() => {}}
                                animatedStyle={{ marginBottom: 5 }}
                                index={index}
                                containerStyle={{
                                    marginBottom: 0,
                                    padding: 0,
                                    ...((item.subExpenseStyle as any) || {}),
                                }}
                            />
                        </Animated.View>
                    ))}
                </Animated.View>
            )}
        </Card>
    )
}
