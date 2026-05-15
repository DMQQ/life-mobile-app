import Header, { HeaderItem } from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useMemo } from "react"
import Background from "@/components/ui/Background"
import { SafeAreaView } from "react-native-safe-area-context"
import SubscriptionsList from "../components/Wallet/SubscriptionsList"
import { WalletScreens } from "../Main"

export default function SubscriptionsListScreen({ navigation }: WalletScreens<"SubscriptionsList">) {
    const [scrollY, onScroll] = useTrackScroll({ screenName: "SubscriptionsListScreen" })

    const buttons = useMemo(
        () =>
            [
                {
                    position: "right",
                    standalone: true,
                    onPress: () => navigation.navigate("EditSubscription"),
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
