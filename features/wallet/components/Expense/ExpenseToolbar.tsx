import { useState } from "react"
import { SFSymbol } from "expo-symbols"
import { ConfirmDialog } from "@/components"
import Toolbar from "@/components/Toolbar/Toolbar"
import useSubscription from "../../hooks/useSubscription"
import useGetSubscriptions from "../../hooks/useGetSubscriptions"
import { useExpense } from "../../pages/ExpenseContext"
import Colors from "@/constants/Colors"

interface Props {
    onUpdate: React.Dispatch<React.SetStateAction<any>>
    onRefund: () => void
    refundLoading: boolean

    onSparklePress: () => void
}

export default function ExpenseToolbar({ onUpdate, onRefund, refundLoading, onSparklePress }: Props) {
    const expense = useExpense()
    const [confirmAction, setConfirmAction] = useState(false)

    const subscription = useSubscription()
    const { data: subscriptionsData } = useGetSubscriptions()

    const isLoading =
        subscription.createSubscriptionState.loading ||
        subscription.cancelSubscriptionState.loading ||
        subscription.assignExpenseToSubscriptionState.loading

    const hasSubscription = !!expense.subscription?.id
    const isActive = hasSubscription && expense.subscription?.isActive

    const subscriptionOptions = [{ id: null, description: "None" }, ...(subscriptionsData?.subscriptions ?? [])]

    const handleAssign = async (subscriptionId: string | null) => {
        const result = await subscription.assignExpenseToSubscription({
            variables: { input: { expenseId: expense.id, subscriptionId } },
        })
        if (result.data?.assignExpenseToSubscription) {
            onUpdate(() => result.data!.assignExpenseToSubscription)
        }
    }

    const handleToggle = async () => {
        if (isActive && expense.subscription?.id) {
            const result = await subscription.cancelSubscription({
                variables: { subscriptionId: expense.subscription.id },
            })
            if (result.data?.cancelSubscription) onUpdate(() => result.data!.cancelSubscription)
        } else {
            const result = await subscription.createSubscription({ variables: { expenseId: expense.id } })
            if (result.data?.createSubscription) onUpdate(() => result.data!.createSubscription)
        }
        setConfirmAction(false)
    }

    return (
        <>
            <Toolbar>
                <Toolbar.Item tintColor={Colors.secondary} sfIcon={"sparkles" as SFSymbol} onPress={onSparklePress} />
                <Toolbar.Spacer />

                <Toolbar.Group>
                    <Toolbar.Item
                        sfIcon={"shuffle" as SFSymbol}
                        menuItems={subscriptionOptions.map((o) => ({
                            label: o.description || "None",
                            sfIcon: "arrow.triangle.swap" as SFSymbol,
                            onPress: () => handleAssign(o.id),
                        }))}
                    />
                    <Toolbar.Item
                        sfIcon={(isActive ? "pause.circle" : "play.circle") as SFSymbol}
                        onPress={() => setConfirmAction(true)}
                        disabled={isLoading}
                    />
                    <Toolbar.Item
                        sfIcon={"arrow.counterclockwise" as SFSymbol}
                        onPress={onRefund}
                        disabled={expense.type === "refunded" || refundLoading}
                    />
                </Toolbar.Group>
            </Toolbar>

            <ConfirmDialog
                isVisible={confirmAction}
                onDismiss={() => setConfirmAction(false)}
                onConfirm={handleToggle}
                title={
                    hasSubscription
                        ? isActive
                            ? "Disable Subscription"
                            : "Enable Subscription"
                        : "Create Subscription"
                }
                description="Are you sure you want to perform this action?"
                loading={isLoading}
            />
        </>
    )
}
