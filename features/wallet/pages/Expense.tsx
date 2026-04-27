import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { Expense as ExpenseType } from "@/types"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { Alert, StyleSheet, View } from "react-native"
import useDeleteActivity from "../hooks/useDeleteActivity"
import useRefund from "../hooks/useRefundExpense"
import useSubscription from "../hooks/useSubscription"
import useGetSubscriptions from "../hooks/useGetSubscriptions"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import MapPicker, { MapPickerHandle } from "../components/Expense/Map"
import SubexpenseStack from "../components/Expense/SubexpenseStack"
import getModalMarginTop from "../utils/modalMarginTop"
import FloatingBottomToolBar, { ContextMenuOption } from "../components/Expense/FloatingBottomToolBar"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import dayjs from "dayjs"
import MonthlyBreakdown from "../components/Expense/MonthlyBreakdown"
import ExpenseDetails from "../components/Expense/ExpenseDetails"
import SimilarExpenses from "../components/Expense/SimilarExpenses"
import FileUpload, { FileUploadHandle } from "../components/Expense/FileUpload"
import SubscriptionSection from "../components/Expense/SubscriptionSection"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

export const GET_EXPENSE = gql`
    query Expense($id: ID!) {
        expense(expenseId: $id) {
            ...ExpenseDetails
        }

        expenseSimilar(expenseId: $id, limit: 20) {
            ...ExpenseDetails
        }

        wallet {
            income
            monthlyPercentageTarget
        }
    }

    fragment ExpenseDetails on ExpenseEntity {
        id
        amount
        date
        description
        type
        category
        balanceBeforeInteraction
        note

        subscription {
            id
            isActive
            nextBillingDate
            dateStart
        }

        location {
            id
            kind
            name
            latitude
            longitude
        }

        files {
            id
            url
        }

        subexpenses {
            id
            description
            amount
            category
        }
    }
`

export default function Expense({ route: { params }, navigation }: any) {
    const { data } = useQuery(GET_EXPENSE, { variables: { id: params?.expense?.id } })

    const [selected, setSelected] = useState(params?.expense)

    useEffect(() => {
        if (data?.expense) {
            setSelected(data.expense)
        }
    }, [data?.expense])

    const [refund, { loading: refundLoading }] = useRefund((data) => {
        if (data.refundExpense.type !== "refunded") return

        setSelected({
            ...selected,
            type: "refunded",
        })
    })

    const handleRefund = () => {
        Alert.alert("Refund Expense", "Are you sure you want to refund this expense?", [
            {
                onPress: async () => {
                    try {
                        await refund({ variables: { expenseId: selected.id } })
                    } catch (error) {
                        Alert.alert("Error", "Failed to refund the expense. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const subscription = useSubscription()
    const { data: subscriptionsData } = useGetSubscriptions()
    const isSubscriptionLoading =
        subscription.createSubscriptionState.loading ||
        subscription.cancelSubscriptionState.loading ||
        subscription.assignExpenseToSubscriptionState.loading

    const hasSubscription = !!selected?.subscription?.id

    const isSubscriptionActive = hasSubscription && selected?.subscription?.isActive

    const subscriptionOptions = [{ id: null, description: "None" }, ...(subscriptionsData?.subscriptions || [])]

    const handleAssignSubscription = async (subscriptionId: string | null) => {
        try {
            const result = await subscription.assignExpenseToSubscription({
                variables: {
                    input: { expenseId: selected.id, subscriptionId },
                },
            })

            if (result.data?.assignExpenseToSubscription) {
                setSelected(result.data.assignExpenseToSubscription)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to assign subscription. Please try again.")
        }
    }

    const handleSubscriptionAction = () => {
        const actionTitle = hasSubscription
            ? isSubscriptionActive
                ? "Disable Subscription"
                : "Enable Subscription"
            : "Create Monthly Subscription"

        Alert.alert(actionTitle, `Are you sure you want to ${actionTitle.toLowerCase()}?`, [
            {
                onPress: async () => {
                    try {
                        if (isSubscriptionActive && selected?.subscription?.id) {
                            const result = await subscription.cancelSubscription({
                                variables: { subscriptionId: selected.subscription.id },
                            })

                            if (result.data?.cancelSubscription) {
                                setSelected(result.data.cancelSubscription)
                            }
                        } else {
                            const result = await subscription.createSubscription({
                                variables: { expenseId: selected.id },
                            })

                            if (result.data?.createSubscription) {
                                setSelected(result.data.createSubscription)
                            }
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to update subscription. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const { deleteActivity } = useDeleteActivity()

    const handleDelete = async () => {
        const onRemove = async () => {
            if (typeof selected?.id !== "undefined")
                await deleteActivity({
                    variables: {
                        id: selected?.id,
                    },

                    onCompleted() {
                        navigation.goBack()
                    },
                })
        }

        Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
            {
                onPress: onRemove,
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const handleEdit = () => {
        navigation.navigate("CreateExpense", {
            ...selected,
            isEditing: true,
        })
    }

    const [deleteSubExpense] = useMutation(gql`
        mutation DeleteSubExpense($id: ID!) {
            deleteSubExpense(id: $id)
        }
    `)

    const handleDeleteSubExpense = async (id: string) => {
        try {
            Alert.alert("Delete Sub-Expense", "Are you sure you want to delete this sub-expense?", [
                {
                    onPress: async () => {
                        try {
                            await deleteSubExpense({ variables: { id } })
                            setSelected((prev: any) => ({
                                ...prev,
                                subexpenses: prev.subexpenses.filter((item: any) => item.id !== id),
                            }))
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
                        }
                    },
                    text: "Yes",
                },
                {
                    onPress: () => {},
                    text: "Cancel",
                },
            ])
        } catch (error) {
            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
        }
    }

    const fileUploadRef = useRef<FileUploadHandle>(null)
    const mapPickerRef = useRef<MapPickerHandle>(null)

    const subscriptionMenuOptions: ContextMenuOption[] = [
        {
            label: hasSubscription
                ? isSubscriptionActive
                    ? "Disable Subscription"
                    : "Enable Subscription"
                : "Create Monthly Subscription",
            icon: hasSubscription ? (isSubscriptionActive ? "pause.circle" : "play.circle") : "plus.circle",
            onPress: handleSubscriptionAction,
        },
        ...(hasSubscription
            ? [
                  {
                      label: "Remove from Subscription",
                      icon: "xmark.circle" as const,
                      onPress: () => handleAssignSubscription(null),
                      destructive: true,
                  },
              ]
            : []),
    ]

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    return (
        <View style={{ flex: 1 }}>
            <Header
                animated
                animatedTitle={capitalize(selected?.description)}
                initialHeight={60}
                titleAnimatedStyle={{ flexWrap: "nowrap" }}
                scrollY={scrollY}
                buttons={[
                    {
                        icon: <Feather name="trash" size={20} color={Colors.foreground} />,
                        onPress: handleDelete,
                    },
                    {
                        icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                        onPress: handleEdit,
                        style: { marginLeft: 5 },
                    },
                ]}
                animatedSubtitle={`${selected.type === "expense" ? "-" : ""}${selected.amount.toFixed(2)}zł`}
                subtitleStyles={{
                    fontSize: 25,
                    color:
                        selected.type === "refunded"
                            ? Colors.secondary_light_2
                            : selected.type === "expense"
                              ? "#F07070"
                              : "#66E875",
                    marginTop: 10,
                    fontWeight: "600",
                }}
                initialTitleFontSize={selected?.description?.length > 25 ? 40 : 50}
            />
            <Animated.ScrollView
                onScroll={onScroll}
                keyboardDismissMode={"on-drag"}
                style={{
                    flex: 1,
                    paddingTop: getModalMarginTop(selected?.description),
                }}
            >
                <View style={{ marginBottom: 30, paddingHorizontal: 15 }}>
                    {selected.subexpenses?.length > 0 && (
                        <View style={{ marginTop: 15 }}>
                            <SubexpenseStack selected={selected} handleDeleteSubExpense={handleDeleteSubExpense} />
                        </View>
                    )}

                    <ExpenseDetails expense={selected} />

                    <View style={{ marginTop: 20 }}>
                        <CollapsibleThemedCalendar
                            date={dayjs(selected?.date).format("YYYY-MM-DD")}
                            markedDates={{ [dayjs(selected?.date).format("YYYY-MM-DD")]: { selected: true } }}
                        />
                    </View>

                    <MonthlyBreakdown
                        expense={selected as ExpenseType}
                        income={data?.wallet?.income || 0}
                        monthlyPercentageTarget={data?.wallet?.monthlyPercentageTarget || 0}
                    />

                    <SubscriptionSection
                        hasSubscription={hasSubscription}
                        isSubscriptionActive={isSubscriptionActive}
                        selected={selected}
                        subscriptionOptions={subscriptionOptions}
                        onAssignSubscription={handleAssignSubscription}
                    />
                </View>

                {data?.similarExpenses?.length > 1 && (
                    <SimilarExpenses
                        selected={selected}
                        similarExpenses={data.expenseSimilar.filter((e: any) => e.id !== selected.id)}
                    />
                )}

                <FileUpload ref={fileUploadRef} id={selected.id} images={selected?.files} />

                <MapPicker ref={mapPickerRef} location={selected.location} id={selected.id} />

                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            <FloatingBottomToolBar
                onRefund={handleRefund}
                refundLoading={refundLoading}
                isRefunded={selected?.type === "refunded"}
                onTakePhoto={() => fileUploadRef.current?.takePhoto()}
                onPickImage={() => fileUploadRef.current?.pickImage()}
                subscriptionMenuOptions={subscriptionMenuOptions}
                isSubscriptionLoading={isSubscriptionLoading}
                hasSubscription={hasSubscription}
                isSubscriptionActive={isSubscriptionActive}
                onSetLocation={() => mapPickerRef.current?.triggerSearch()}
            />
        </View>
    )
}
