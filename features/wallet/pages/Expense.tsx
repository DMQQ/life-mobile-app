import Header from "@/components/ui/Header/Header"
import ExpenseSkeleton from "../components/Expense/ExpenseSkeleton"
import Colors from "@/constants/Colors"
import { Expense as ExpenseType } from "@/types"
import { gql, useMutation, useQuery } from "@apollo/client"
import { GET_EXPENSE } from "../hooks/getExpenseQuery"
import { SFSymbol, SymbolView } from "expo-symbols"
import { useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import useDeleteActivity from "../hooks/useDeleteActivity"
import useRefund from "../hooks/useRefundExpense"
import useSubscription from "../hooks/useSubscription"
import useGetSubscriptions from "../hooks/useGetSubscriptions"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import MapPicker, { MapPickerHandle } from "../components/Expense/Map"
import SubexpenseStack from "../components/Expense/SubexpenseStack"
import FloatingBottomToolBar, { ContextMenuOption } from "../components/Expense/FloatingBottomToolBar"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import dayjs from "dayjs"
import MonthlyBreakdown from "../components/Expense/MonthlyBreakdown"
import ExpenseDetails from "../components/Expense/ExpenseDetails"
import SimilarExpenses from "../components/Expense/SimilarExpenses"
import FileUpload, { FileUploadHandle } from "../components/Expense/FileUpload"
import SubscriptionSection from "../components/Expense/SubscriptionSection"
import { ConfirmDialog } from "@/components"
import Section from "@/components/ui/Section"
import { CategoryIcon, CategoryUtils } from "../components/Expense/ExpenseIcon"
import Background from "@/components/ui/Background"
import AddSubExpenseSheet, { AddSubExpenseSheetHandle } from "../components/Expense/AddSubExpenseSheet"
import { useUploadSubExpense } from "../hooks/useUploadSubExpense"
import Feedback from "react-native-haptic-feedback"

export default function Expense({ route: { params }, navigation }: any) {
    const { data } = useQuery(GET_EXPENSE, { variables: { id: params?.expense?.id ?? params?.expenseId } })

    const [selected, setSelected] = useState(params?.expense ?? null)

    useEffect(() => {
        if (data?.expense) setSelected(data.expense)
    }, [data?.expense])

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
    const addSubExpenseSheetRef = useRef<AddSubExpenseSheetHandle>(null)

    const [uploadSubexpenses] = useUploadSubExpense(() => {})

    const handleAddSubExpense = async (item: { description: string; amount: number; category: string }) => {
        const result = await uploadSubexpenses({
            variables: {
                input: {
                    expenseId: selected.id,
                    inputs: [{ description: item.description, amount: item.amount, category: item.category }],
                },
            },
        })
        if (result.data?.addMultipleSubExpenses) {
            setSelected((prev: any) => ({
                ...prev,
                subexpenses: [...(prev.subexpenses || []), ...result.data!.addMultipleSubExpenses],
            }))
        }
    }

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
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    if (!selected) return <ExpenseSkeleton />

    return (
        <View style={{ flex: 1 }}>
            <Header
                goBack
                scrollY={scrollY}
                shadow={false}
                buttons={[
                    {
                        icon: "trash" as SFSymbol,
                        onPress: handleDeleteConfirm,
                        tintColor: Colors.danger,
                        confirm: true,
                    },
                    // {
                    //     icon: "arrow.triangle.branch" as SFSymbol,
                    //     onPress: () =>
                    //         navigation.navigate("CorrectionMaps", {
                    //             prefill: {
                    //                 shop: selected?.shop || undefined,
                    //                 description: selected?.description || undefined,
                    //                 category: selected?.category || undefined,
                    //                 amount: selected?.amount || undefined,
                    //             },
                    //         }),
                    // },
                    {
                        icon: "pencil" as SFSymbol,
                        onPress: () => navigation.navigate("CreateExpense", { ...selected, isEditing: true }),
                    },
                ]}
            />

            <Background tintColor={CategoryUtils.getCategoryColor(selected?.category, selected?.type)} />

            <Animated.ScrollView
                onScroll={onScroll}
                keyboardDismissMode="on-drag"
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 150 }}
            >
                <View style={{ width: "100%", height: 150, justifyContent: "center", alignItems: "center", gap: 7.5 }}>
                    <CategoryIcon
                        category={selected?.category}
                        size={60}
                        type={selected?.type}
                        containerStyle={{
                            width: 100,
                            height: 100,
                            borderRadius: 100,
                        }}
                    />
                    <Text size={15} color={Colors.text_dark}>
                        {selected?.description}
                    </Text>
                    <Text size={40} weight="500" color="#fff" mono>
                        {selected?.amount}zł
                    </Text>
                </View>

                <View style={styles.scrollContent}>
                    <Section
                        title="Subexpenses"
                        headerRight={
                            <Pressable
                                onPress={() => {
                                    Feedback.trigger("impactLight")
                                    addSubExpenseSheetRef.current?.expand()
                                }}
                                style={styles.addSubBtn}
                            >
                                <SymbolView name="plus.circle.fill" size={18} tintColor={Colors.secondary} />
                            </Pressable>
                        }
                    >
                        {selected.subexpenses?.length > 0 ? (
                            <SubexpenseStack
                                selected={selected}
                                handleDeleteSubExpense={(id) => setConfirmSubExpenseId(id)}
                            />
                        ) : (
                            <Pressable
                                onPress={() => {
                                    Feedback.trigger("impactLight")
                                    addSubExpenseSheetRef.current?.expand()
                                }}
                                style={styles.emptySubRow}
                            >
                                <Text size={13} color={Colors.text_dark}>Add sub-expenses to break down this expense</Text>
                            </Pressable>
                        )}
                    </Section>

                    <ExpenseDetails expense={selected} />

                    <Section title="Calendar">
                        <CollapsibleThemedCalendar
                            date={dayjs(selected?.date).format("YYYY-MM-DD")}
                            markedDates={{ [dayjs(selected?.date).format("YYYY-MM-DD")]: { selected: true } }}
                        />
                    </Section>

                    {selected?.type === "expense" && (
                        <Section title="Breakdown">
                            <MonthlyBreakdown
                                expense={selected as ExpenseType}
                                income={data?.wallet?.income || 0}
                                monthlyPercentageTarget={data?.wallet?.monthlyPercentageTarget || 0}
                            />
                        </Section>
                    )}

                    {hasSubscription && (
                        <Section title="Subscription">
                            <SubscriptionSection
                                hasSubscription={hasSubscription}
                                isSubscriptionActive={isSubscriptionActive}
                                selected={selected}
                            />
                        </Section>
                    )}
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
                subscriptionOptions={subscriptionOptions}
                onAssignSubscription={handleAssignSubscription}
                isSubscriptionLoading={isSubscriptionLoading}
                hasSubscription={hasSubscription}
                isSubscriptionActive={isSubscriptionActive}
                onSetLocation={() => mapPickerRef.current?.triggerSearch()}
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

            <AddSubExpenseSheet ref={addSubExpenseSheetRef} onAdd={handleAddSubExpense} />

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
        paddingHorizontal: 15,
    },
    section: {
        marginTop: 20,
    },
    bottomSpacer: {
        height: 100,
    },
    addSubBtn: {
        padding: 2,
    },
    emptySubRow: {
        paddingHorizontal: 15,
        paddingVertical: 14,
    },
})
