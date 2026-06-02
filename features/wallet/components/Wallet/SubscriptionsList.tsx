import { FONTS } from "@/constants/Fonts"
import Section from "@/components/ui/Section"
import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import { ReactNode, useCallback, useMemo, useState } from "react"
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
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
    dateEnd?: string | null
    description: string
    isActive: boolean
    nextBillingDate: string
    billingCycle: string
    billingDay?: number | null
    customBillingMonths?: number[] | null
    reminderDaysBeforehand?: number | null
    totalSpent?: number
    totalAmount?: number
    totalDuration?: number
    expenses?: {
        amount: number
        id: string
        date: string
        description: string
    }[]
}

type ListItem = { type: "section"; title: string; subscriptions: Subscription[] }

const getItem = (data: ListItem[], index: number) => data[index]
const getItemCount = (data: ListItem[]) => data.length
const keyExtractor = (item: ListItem) => item.title

const AnimatedList = Animated.createAnimatedComponent(VirtualizedList<ListItem>)

interface Props {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
    listHeader?: ReactNode
}

export default function SubscriptionsList({ onScroll, listHeader }: Props) {
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
            list.push({ type: "section", title: "Active", subscriptions: active })
        }
        if (inactive.length > 0) {
            list.push({ type: "section", title: "Inactive", subscriptions: inactive })
        }
        return list
    }, [active, inactive])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        refetch?.()
        setRefreshing(false)
    }, [refetch])

    const renderItem = useCallback(
        ({ item }: { item: ListItem }) => (
            <Section title={item.title}>
                {item.subscriptions.map((sub, index) => (
                    <SubscriptionItem
                        key={sub.id}
                        subscription={sub}
                        index={index}
                        style={{
                            borderWidth: 0,
                            borderBottomWidth: item.subscriptions.length - 1 === index ? 0 : 1,
                        }}
                        onPress={() => navigation.navigate("Subscription", { subscriptionId: sub.id })}
                    />
                ))}
            </Section>
        ),
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
                <>
                    {listHeader}
                    <Section title="Calendar">
                        <View style={{ padding: 15 }}>
                            <SubscriptionCalendar subscriptions={[...active, ...inactive] as any} />
                        </View>
                    </Section>
                </>
            }
            stickyHeaderIndices={listHeader ? [0] : undefined}
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
        paddingTop: 186,
        paddingBottom: 120,
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
        fontFamily: FONTS.semibold,
        marginBottom: 8,
    },
    emptySubtext: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        textAlign: "center",
    },
})
