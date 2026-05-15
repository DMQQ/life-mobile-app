import Header, { HeaderItem } from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useMemo } from "react"
import Background from "@/components/ui/Background"
import { SafeAreaView } from "react-native-safe-area-context"
import SubscriptionsList from "../components/Wallet/SubscriptionsList"
import { router } from "expo-router"

export default function SubscriptionsListScreen() {
    const [scrollY, onScroll] = useTrackScroll({ screenName: "SubscriptionsListScreen" })

    const buttons = useMemo(
        () =>
            [
                {
                    position: "right",
                    standalone: true,
                    onPress: () => router.push("/(tabs)/wallet/subscription/[id]/edit"),
                    icon: <Feather name="plus" size={20} color={Colors.foreground} />,
                },
            ] as HeaderItem[],
        [],
    )

    const header = useMemo(
        () => (
            <Header
                scrollY={scrollY}
                animated={true}
                goBack={false}
                buttons={buttons}
                animatedTitle="Subscriptions"
                animatedSubtitle="Recurring payments"
            />
        ),
        [buttons],
    )

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Background />
            {header}
            <SubscriptionsList onScroll={onScroll} />
        </SafeAreaView>
    )
}
