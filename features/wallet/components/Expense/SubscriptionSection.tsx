import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import moment from "moment"
import SubscriptionItem from "../Subscription/SubscriptionItem"
import { useNavigation } from "@react-navigation/native"

interface SubscriptionSectionProps {
    hasSubscription: boolean
    isSubscriptionActive: boolean
    selected: any
}

export default function SubscriptionSection({
    hasSubscription,
    isSubscriptionActive,
    selected,
}: SubscriptionSectionProps) {
    const navigation = useNavigation()
    if (!hasSubscription) return null

    return (
        <View style={styles.content}>
            <View style={styles.cardHeader}>
                <Text size={13} weight="500" color={Colors.text_dark}>
                    Status
                </Text>
                <View
                    style={[
                        styles.statusPill,
                        {
                            backgroundColor: isSubscriptionActive
                                ? "rgba(102,232,117,0.15)"
                                : "rgba(255,255,255,0.07)",
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: isSubscriptionActive ? "#66E875" : Colors.text_dark },
                        ]}
                    />
                    <Text size={12} weight="600" color={isSubscriptionActive ? "#66E875" : Colors.text_dark}>
                        {isSubscriptionActive ? "Active" : "Inactive"}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDates}>
                <View style={styles.dateRow}>
                    <Text size={13} weight="500" color={Colors.text_dark}>
                        {isSubscriptionActive ? "Next payment" : "Last payment"}
                    </Text>
                    <Text size={13} weight="500" color={Colors.foreground_secondary}>
                        {selected.subscription?.nextBillingDate
                            ? moment(+selected.subscription.nextBillingDate).format("MMM D, YYYY")
                            : "—"}
                    </Text>
                </View>
                <View style={styles.dateRow}>
                    <Text size={13} weight="500" color={Colors.text_dark}>
                        {isSubscriptionActive ? "Active since" : "Created on"}
                    </Text>
                    <Text size={13} weight="500" color={Colors.foreground_secondary}>
                        {moment(+selected.subscription.dateStart).format("MMM D, YYYY")}
                    </Text>
                </View>
            </View>

            {selected?.subscription?.amount && (
                <SubscriptionItem
                    index={0}
                    onPress={() =>
                        navigation.navigate("Subscription", {
                            subscriptionId: selected.subscription.id,
                        })
                    }
                    style={{ padding: 0, borderWidth: 0, paddingHorizontal: 0 }}
                    subscription={selected?.subscription}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    cardDates: {
        marginTop: 12,
        gap: 15,
        marginBottom: 15,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
})
