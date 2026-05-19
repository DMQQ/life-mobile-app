import Header from "@/components/ui/Header/Header"
import PulsingIndicator from "@/components/ui/PulsingIndicator"
import Colors from "@/constants/Colors"
import { useRefresh } from "@/utils/context/RefreshContext"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import useAppBackground from "@/utils/hooks/useAppBackground"
import useRoutinePendingCompletions from "@/utils/widget/hooks/useRoutinePendingCompletions"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import * as SplashScreen from "expo-splash-screen"
import { useMemo, useState } from "react"
import { View } from "react-native"
import Animated from "react-native-reanimated"
import { FloatingNotifications, useGetNotifications } from "../wallet/components/Wallet/WalletNotifications"
import LoadingSkeleton from "./components/LoadingSkeleton"
import ChartSwitcher from "./components/ChartSwitcher"
import CategoryBreakdown from "@/features/wallet/components/Wallet/CategoryBreakdown"
import HomeExtras from "@/features/home/components/HomeExtras"
import TimelineWidget from "@/features/home/components/TimelineWidget"
import Background from "@/components/ui/Background"
import { HomeScreenProps } from "./Main"
import { RefreshControl } from "react-native"

export default function Root({ navigation }: HomeScreenProps<"HomeRoot">) {
    const [loading, setLoading] = useState(true)

    const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
        variables: getMainScreenBaseVariables(),
        onCompleted: async () => {
            await SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 500)
        },
        onError: () => {
            SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 500)
        },
    })

    const { refetch: refetchNotifications, data } = useGetNotifications()
    const { refreshing, refresh } = useRefresh([refetchHome, refetchNotifications], [])
    const [scrollY, onScroll] = useTrackScroll({ screenName: "Root" })

    const { processPending } = useRoutinePendingCompletions()
    useAppBackground({
        onForeground: () => {
            refresh()
            processPending()
        },
    })

    const trendPercentage = home?.lastMonthSpendings?.expense
        ? ((home?.monthlySpendings?.expense - home?.lastMonthSpendings?.expense) / home?.lastMonthSpendings?.expense) *
          100
        : 0
    const isIncreasing = trendPercentage > 0

    const headerButtons = useMemo(
        () => [
            {
                icon: "bell",
                onPress: () => navigation.navigate("HomeNotifications"),
            },
            {
                icon: "gear",
                onPress: () => navigation.navigate("HomeSettings"),
            },
        ],
        [data?.notifications, navigation],
    )

    return (
        <View style={{ flex: 1 }}>
            <Background />
            {loading && <LoadingSkeleton />}

            <FloatingNotifications />

            <Header
                goBack={false}
                animatedValue={parseFloat(home?.monthlySpendings?.expense || 0)}
                animatedValueLoading={loading && home?.wallet?.balance === undefined}
                animatedValueFormat={(value) => `${value?.toFixed(2)}zł`}
                animatedSubtitle={`This month spendings, ${Math.abs(trendPercentage).toFixed(1)}% ${isIncreasing ? "more" : "less"} vs last month`}
                scrollY={scrollY}
                animated={true}
                buttons={headerButtons}
            />

            <Animated.ScrollView
                scrollToOverflowEnabled={false}
                overScrollMode={"never"}
                keyboardDismissMode={"on-drag"}
                scrollEventThrottle={16}
                onScroll={onScroll}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingBottom: 120,
                    paddingTop: 170,
                    gap: 10,
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            >
                <ChartSwitcher />

                <CategoryBreakdown />

                <TimelineWidget />
                <HomeExtras />
            </Animated.ScrollView>
        </View>
    )
}
