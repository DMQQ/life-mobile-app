import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import { Expense as ExpenseType } from "@/types"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
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
import { ConfirmDialog } from "@/components"

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
        spontaneousRate
        subAccountId
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
        if (data?.expense) setSelected(data.expense)
    }, [data?.expense])

    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmRefund, setConfirmRefund] = useState(false)
    const [confirmSubExpenseId, setConfirmSubExpenseId] = useState<string | null>(null)
    const [confirmSubscriptionAction, setConfirmSubscriptionAction] = useState(false)

    const [refund, { loading: refundLoading }] = useRefund((data) => {
        if (data.refundExpense.type !== "refunded") return
        setSelected((prev: any) => ({ ...prev, type: "refunded" }))
    })

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
        const result = await subscription.assignExpenseToSubscription({
            variables: { input: { expenseId: selected.id, subscriptionId } },
        })
        if (result.data?.assignExpenseToSubscription) setSelected(result.data.assignExpenseToSubscription)
    }

    const handleSubscriptionConfirm = async () => {
        if (isSubscriptionActive && selected?.subscription?.id) {
            const result = await subscription.cancelSubscription({
                variables: { subscriptionId: selected.subscription.id },
            })
            if (result.data?.cancelSubscription) setSelected(result.data.cancelSubscription)
        } else {
            const result = await subscription.createSubscription({ variables: { expenseId: selected.id } })
            if (result.data?.createSubscription) setSelected(result.data.createSubscription)
        }
        setConfirmSubscriptionAction(false)
    }

    const { deleteActivity } = useDeleteActivity()

    const handleDeleteConfirm = async () => {
        if (!selected?.id) return
        await deleteActivity({
            variables: { id: selected.id },
            onCompleted: () => navigation.goBack(),
        })
        setConfirmDelete(false)
    }

    const handleRefundConfirm = async () => {
        await refund({ variables: { expenseId: selected.id } })
        setConfirmRefund(false)
    }

    const [deleteSubExpense] = useMutation(gql`
        mutation DeleteSubExpense($id: ID!) {
            deleteSubExpense(id: $id)
        }
    `)

    const handleDeleteSubExpenseConfirm = async () => {
        if (!confirmSubExpenseId) return
        await deleteSubExpense({ variables: { id: confirmSubExpenseId } })
        setSelected((prev: any) => ({
            ...prev,
            subexpenses: prev.subexpenses.filter((item: any) => item.id !== confirmSubExpenseId),
        }))
        setConfirmSubExpenseId(null)
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
            onPress: () => setConfirmSubscriptionAction(true),
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
        onScroll: (ev) => { scrollY.value = ev.contentOffset.y },
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
                        onPress: () => setConfirmDelete(true),
                    },
                    {
                        icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                        onPress: () => navigation.navigate("CreateExpense", { ...selected, isEditing: true }),
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
                keyboardDismissMode="on-drag"
                style={{ flex: 1, paddingTop: getModalMarginTop(selected?.description) }}
            >
                <View style={styles.scrollContent}>
                    {selected.subexpenses?.length > 0 && (
                        <View style={styles.section}>
                            <SubexpenseStack
                                selected={selected}
                                handleDeleteSubExpense={(id) => setConfirmSubExpenseId(id)}
                            />
                        </View>
                    )}

                    <ExpenseDetails expense={selected} />

                    <View style={styles.section}>
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

                {data?.expenseSimilar?.length > 1 && (
                    <SimilarExpenses
                        selected={selected}
                        similarExpenses={data.expenseSimilar.filter((e: any) => e.id !== selected.id)}
                    />
                )}

                <FileUpload ref={fileUploadRef} id={selected.id} images={selected?.files} />
                <MapPicker ref={mapPickerRef} location={selected.location} id={selected.id} />

                <View style={styles.bottomSpacer} />
            </Animated.ScrollView>

            <FloatingBottomToolBar
                onRefund={() => setConfirmRefund(true)}
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

            <ConfirmDialog
                isVisible={confirmDelete}
                onDismiss={() => setConfirmDelete(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Expense"
                description="This expense will be permanently removed."
                destructive
            />

            <ConfirmDialog
                isVisible={confirmRefund}
                onDismiss={() => setConfirmRefund(false)}
                onConfirm={handleRefundConfirm}
                title="Refund Expense"
                description="Mark this expense as refunded?"
                confirmLabel="Refund"
                loading={refundLoading}
            />

            <ConfirmDialog
                isVisible={!!confirmSubExpenseId}
                onDismiss={() => setConfirmSubExpenseId(null)}
                onConfirm={handleDeleteSubExpenseConfirm}
                title="Delete Sub-Expense"
                description="This cannot be undone."
                destructive
            />

            <ConfirmDialog
                isVisible={confirmSubscriptionAction}
                onDismiss={() => setConfirmSubscriptionAction(false)}
                onConfirm={handleSubscriptionConfirm}
                title={
                    hasSubscription
                        ? isSubscriptionActive
                            ? "Disable Subscription"
                            : "Enable Subscription"
                        : "Create Subscription"
                }
                description="Are you sure you want to perform this action?"
                loading={isSubscriptionLoading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        marginBottom: 30,
        paddingHorizontal: 15,
    },
    section: {
        marginTop: 20,
    },
    bottomSpacer: {
        height: 100,
    },
})
