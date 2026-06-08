import { FONTS } from "@/constants/Fonts"
import { formatAmount } from "@/utils/functions/formatCurrency"
import Section from "@/components/ui/Section"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import useGetSubscriptions from "@/features/wallet/hooks/useGetSubscriptions"
import SubscriptionItem from "@/features/wallet/components/Subscription/SubscriptionItem"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import dayjs from "dayjs"
import { useMemo } from "react"
import { StyleSheet, View } from "react-native"

export default function UpcomingBillsWidget() {
    const navigation = useNavigation<any>()
    const { data } = useGetSubscriptions()

    const bills = useMemo(() => {
        const all = data?.subscriptions ?? []
        return all
            .filter((s) => s.isActive && s.nextBillingDate)
            .map((s) => ({
                ...s,
                daysUntil: dayjs(parseInt(s.nextBillingDate as string)).diff(dayjs().startOf("day"), "day"),
            }))
            .filter((s) => s.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 4)
    }, [data])

    const totalDue7d = useMemo(() => bills.filter((b) => b.daysUntil <= 7).reduce((a, b) => a + b.amount, 0), [bills])

    if (!bills.length) return null

    return (
        <Section
            title="Upcoming Bills"
            headerRight={
                <Feather
                    name="chevron-right"
                    size={14}
                    color={Colors.text_dark}
                    onPress={() => navigation.navigate("WalletScreens", { screen: "Wallet" })}
                />
            }
        >
            <View style={s.card}>
                {totalDue7d > 0 && (
                    <View style={[s.summaryPill, { backgroundColor: Color(Colors.warning).alpha(0.12).string() }]}>
                        <Feather name="alert-circle" size={11} color={Colors.warning} />
                        <Text style={[s.summaryText, { color: Colors.warning }]}>
                            {formatAmount(totalDue7d, 0)} zł due within 7 days
                        </Text>
                    </View>
                )}

                {bills.map(({ daysUntil, ...sub }, i) => (
                    <SubscriptionItem
                        key={sub.id}
                        subscription={sub as any}
                        index={i}
                        style={[s.subItem, i < bills.length - 1 && s.subItemBorder]}
                        onPress={() =>
                            navigation.navigate("WalletScreens", {
                                screen: "Subscription",
                                params: { subscriptionId: sub.id },
                            })
                        }
                    />
                ))}
            </View>
        </Section>
    )
}

const s = StyleSheet.create({
    card: {
        padding: 14,
        paddingTop: 12,
    },
    summaryPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
    },
    subItem: {
        borderRadius: 0,
        borderWidth: 0,
        paddingVertical: 6,
        paddingHorizontal: 0,
    },
    subItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.08)",
        marginBottom: 0,
    },
})
