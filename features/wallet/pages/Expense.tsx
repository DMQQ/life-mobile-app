import { useEffect, useState } from "react"
import { SFSymbol } from "expo-symbols"
import { View, StyleSheet } from "react-native"
import { useQuery } from "@apollo/client"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import dayjs from "dayjs"

import Header from "@/components/ui/Header/Header"
import Background from "@/components/ui/Background"
import Section from "@/components/ui/Section"
import { ConfirmDialog, Body, Caption } from "@/components"
import Colors from "@/constants/Colors"
import { Expense as ExpenseType } from "@/types"
import { formatAmount } from "@/utils/functions/formatCurrency"

import { GET_EXPENSE } from "../hooks/getExpenseQuery"
import useDeleteActivity from "../hooks/useDeleteActivity"
import useRefund from "../hooks/useRefundExpense"

import ExpenseContext from "./ExpenseContext"
import ExpenseSkeleton from "../components/Expense/ExpenseSkeleton"
import ExpenseDetails from "../components/Expense/ExpenseDetails"
import MonthlyBreakdown from "../components/Expense/MonthlyBreakdown"
import SimilarExpenses from "../components/Expense/SimilarExpenses"
import SubscriptionSection from "../components/Expense/SubscriptionSection"
import SubExpenseSection from "../components/Expense/SubExpenseSection"
import ShopSection from "../components/Expense/ShopSection"
import ExpenseToolbar from "../components/Expense/ExpenseToolbar"
import ExpenseAttachments from "../components/Expense/FileUpload"
import ExpenseLocationMap from "../components/Expense/Map"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import { CategoryIcon, CategoryUtils } from "../components/Expense/ExpenseIcon"
import { FONTS } from "@/constants/Fonts"

export default function Expense({ route: { params }, navigation }: any) {
    const { data } = useQuery(GET_EXPENSE, { variables: { id: params?.expense?.id ?? params?.expenseId } })
    const [selected, setSelected] = useState<ExpenseType | null>(params?.expense ?? null)

    useEffect(() => {
        if (data?.expense) setSelected(data.expense)
    }, [data?.expense])

    const [confirmRefund, setConfirmRefund] = useState(false)

    const { deleteActivity } = useDeleteActivity()
    const [refund, { loading: refundLoading }] = useRefund((refundData: any) => {
        if (refundData.refundExpense.type !== "refunded") return
        setSelected((prev: any) => ({ ...prev, type: "refunded" }))
    })

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    const handleDeleteConfirm = async () => {
        if (!selected?.id) return
        await deleteActivity({
            variables: { id: selected.id },
            onCompleted: () => navigation.goBack(),
        })
    }

    const handleRefundConfirm = async () => {
        await refund({ variables: { expenseId: selected!.id } })
        setConfirmRefund(false)
    }

    return (
        <View style={styles.root}>
            <Header
                goBack
                scrollY={scrollY}
                shadow={false}
                title={selected?.description}
                buttons={[
                    {
                        icon: "trash" as SFSymbol,
                        onPress: handleDeleteConfirm,
                        tintColor: Colors.danger,
                        confirm: true,
                    },
                    {
                        icon: "pencil" as SFSymbol,
                        onPress: () => navigation.navigate("CreateExpense", { ...selected, isEditing: true }),
                    },
                ]}
            />

            <Background tintColor={CategoryUtils.getCategoryColor(selected?.category as any, selected?.type as any)} />

            {!selected ? (
                <ExpenseSkeleton />
            ) : (
                <ExpenseContext.Provider value={{ expense: selected }}>
                    <Animated.ScrollView
                        onScroll={onScroll}
                        keyboardDismissMode="on-drag"
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <ExpenseHero expense={selected} />

                        <View style={styles.sections}>
                            <SubExpenseSection onUpdate={setSelected} />
                            <ExpenseDetails expense={selected} />

                            <Section title="Calendar">
                                <CollapsibleThemedCalendar
                                    date={dayjs(selected.date).format("YYYY-MM-DD")}
                                    markedDates={{ [dayjs(selected.date).format("YYYY-MM-DD")]: { selected: true } }}
                                />
                            </Section>

                            {selected.type === "expense" && (
                                <Section title="Breakdown">
                                    <MonthlyBreakdown
                                        expense={selected as ExpenseType}
                                        income={data?.wallet?.income ?? 0}
                                        monthlyPercentageTarget={data?.wallet?.monthlyPercentageTarget ?? 0}
                                    />
                                </Section>
                            )}

                            <Section title="Subscription">
                                <SubscriptionSection
                                    hasSubscription={!!selected.subscription?.id}
                                    isSubscriptionActive={
                                        !!selected.subscription?.id && !!selected.subscription?.isActive
                                    }
                                    selected={selected}
                                />
                            </Section>

                            <ShopSection onUpdate={setSelected} />
                        </View>

                        {data?.expenseSimilar?.length > 1 && (
                            <SimilarExpenses
                                selected={selected}
                                similarExpenses={data.expenseSimilar.filter((e: any) => e.id !== selected.id)}
                            />
                        )}

                        <ExpenseAttachments id={selected.id} images={selected?.files ?? []} />
                        <ExpenseLocationMap location={selected.location} id={selected.id} />

                        <View style={styles.bottomSpacer} />
                    </Animated.ScrollView>

                    <ConfirmDialog
                        isVisible={confirmRefund}
                        onDismiss={() => setConfirmRefund(false)}
                        onConfirm={handleRefundConfirm}
                        title="Refund Expense"
                        description="Mark this expense as refunded?"
                        confirmLabel="Refund"
                        loading={refundLoading}
                    />

                    <ExpenseToolbar
                        onUpdate={setSelected}
                        onRefund={() => setConfirmRefund(true)}
                        refundLoading={refundLoading}
                    />
                </ExpenseContext.Provider>
            )}
        </View>
    )
}

function ExpenseHero({ expense }: { expense: ExpenseType }) {
    return (
        <View style={styles.hero}>
            <CategoryIcon
                category={expense.category as any}
                size={60}
                type={expense.type as any}
                imageUri={expense.shopEntity?.image}
                containerStyle={styles.heroIcon}
            />
            <Caption style={styles.heroCategory}>{CategoryUtils.getCategoryName(expense.category as any)}</Caption>
            <Body style={styles.heroAmount}>{formatAmount(expense.amount)}zł</Body>
            <Caption style={styles.heroDescription}>{expense.description}</Caption>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 150,
    },
    hero: {
        width: "100%",
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        gap: 7.5,
    },
    heroIcon: {
        width: 100,
        height: 100,
        borderRadius: 100,
    },
    heroCategory: {
        color: Colors.text_dark,
    },
    heroAmount: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: "#fff",
    },
    heroDescription: {
        color: Colors.text_dark,
    },
    sections: {
        paddingHorizontal: 15,
    },
    bottomSpacer: {
        height: 100,
    },
})
