import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import { useCallback, useMemo, useState } from "react"
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    VirtualizedList,
} from "react-native"
import Animated from "react-native-reanimated"
import useGetSubscriptions from "../../hooks/useGetSubscriptions"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import SubscriptionCalendar from "./SubscriptionCalendar"

interface Subscription {
    id: string
    amount: number
    dateStart: string
    dateEnd: string
    description: string
    isActive: boolean
    nextBillingDate: string
    billingCycle: string
    expenses: {
        amount: number
        id: string
        date: string
        description: string
        category: string
    }[]
}

type ListItem =
    | { type: "header"; title: string; count: number; color: string }
    | { type: "subscription"; data: Subscription; index: number }

const getItem = (data: ListItem[], index: number) => data[index]
const getItemCount = (data: ListItem[]) => data.length
const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === "header") return `header-${item.title}`
    if (item.type === "subscription") return `sub-${item.data.id}`
    return `item-${index}`
}

const AnimatedList = Animated.createAnimatedComponent(VirtualizedList<ListItem>)

interface Props {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export default function SubscriptionsList({ onScroll }: Props) {
    const navigation = useNavigation<any>()
    const { data, refetch } = useGetSubscriptions()
    const [refreshing, setRefreshing] = useState(false)

    const { active, inactive } = useMemo(() => {
        const subs: Subscription[] = data?.subscriptions ?? []
        return {
            active: subs.filter((s) => s.isActive),
            inactive: subs.filter((s) => !s.isActive),
        }
    }, [data?.subscriptions])

    const items: ListItem[] = useMemo(() => {
        const list: ListItem[] = []
        if (active.length > 0) {
            list.push({ type: "header", title: "Active", count: active.length, color: Colors.secondary })
            active.forEach((sub, index) => list.push({ type: "subscription", data: sub, index }))
        }
        if (inactive.length > 0) {
            list.push({ type: "header", title: "Inactive", count: inactive.length, color: "#F07070" })
            inactive.forEach((sub, index) =>
                list.push({ type: "subscription", data: sub, index: index + active.length }),
            )
        }
        return list
    }, [active, inactive])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        refetch?.()
        setRefreshing(false)
    }, [refetch])

    const renderItem = useCallback(
        ({ item }: { item: ListItem }) => {
            if (item.type === "header") {
                return (
                    <Text style={[styles.sectionTitle, { color: item.color }]}>
                        {item.title} ({item.count})
                    </Text>
                )
            }
            return (
                <SubscriptionItem
                    subscription={item.data}
                    index={item.index}
                    onPress={() => navigation.navigate("Subscription", { subscriptionId: item.data.id })}
                />
            )
        },
        [navigation],
    )

    if (!data?.subscriptions || data.subscriptions.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No subscriptions found</Text>
                <Text style={styles.emptySubtext}>Add your first subscription to start tracking</Text>
            </View>
        )
    }

    return (
        <AnimatedList
            keyboardDismissMode="on-drag"
            data={items}
            getItem={getItem}
            getItemCount={getItemCount}
            renderItem={renderItem as any}
            keyExtractor={keyExtractor as any}
            onScroll={onScroll}
            ListHeaderComponent={
                <SubscriptionCalendar subscriptions={[...active, ...inactive]} />
            }
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            removeClippedSubviews
            windowSize={4}
            initialNumToRender={8}
        />
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 15,
        paddingTop: 230,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontSize: 25,
        fontWeight: "700",
        marginTop: 30,
        marginBottom: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        color: Colors.text_light,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        textAlign: "center",
    },
})
