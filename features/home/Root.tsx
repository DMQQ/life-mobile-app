import Header from "@/components/ui/Header/Header"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { useRefresh } from "@/utils/context/RefreshContext"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import useAppBackground from "@/utils/hooks/useAppBackground"
import useRoutinePendingCompletions from "@/utils/widget/hooks/useRoutinePendingCompletions"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useQuery } from "@apollo/client"
import * as SplashScreen from "expo-splash-screen"
import { useMemo, useState } from "react"
import Animated from "react-native-reanimated"
import { FloatingNotifications, useGetNotifications } from "../wallet/components/Wallet/WalletNotifications"
import LoadingSkeleton from "./components/LoadingSkeleton"
import Background from "@/components/ui/Background"
import { HomeScreenProps } from "./Main"
import { RefreshControl } from "react-native"
import { useHomeWidgets } from "./hooks/useHomeWidgets"
import { WIDGETS } from "./widgets/registry"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Root({ navigation }: HomeScreenProps<"HomeRoot">) {
    const [loading, setLoading] = useState(true)

    const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
        variables: getMainScreenBaseVariables(),
        onCompleted: async () => {
            await SplashScreen.hideAsync()
            setLoading(false)
        },
        onError: () => {
            SplashScreen.hideAsync()
            setLoading(false)
        },
    })

    const { refetch: refetchNotifications, data } = useGetNotifications()
    const { refreshing, refresh } = useRefresh([refetchHome, refetchNotifications], [])
    const [scrollY, onScroll] = useTrackScroll({ screenName: "Root" })

    const { enabled, order } = useHomeWidgets()
    const { processPending } = useRoutinePendingCompletions()

    useAppBackground(
        useMemo(
            () => ({
                onForeground: () => {
                    refresh()
                    processPending()
                },
            }),
            [refresh, processPending],
        ),
    )

    const trendPercentage = home?.lastMonthSpendings?.expense
        ? ((home?.monthlySpendings?.expense - home?.lastMonthSpendings?.expense) / home?.lastMonthSpendings?.expense) *
          100
        : 0
    const isIncreasing = trendPercentage > 0

    const unreadNotifications = useMemo(() => {
        return data?.notifications.reduce((acc, curr) => {
            if (!curr.read) return acc + 1
            return acc
        }, 0)
    }, [data?.notifications])

    const headerButtons = useMemo(
        () => [
            {
                icon: "bell",
                onPress: () => navigation.navigate("HomeNotifications"),
                badge: unreadNotifications,
            },
            {
                icon: "gear",
                onPress: () => navigation.navigate("HomeSettings"),
            },
        ],
        [unreadNotifications, navigation],
    )

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            <Background />
            {loading && <LoadingSkeleton />}

            <Header
                goBack={false}
                animatedValue={parseFloat(home?.monthlySpendings?.expense || 0)}
                animatedValueLoading={loading && home?.wallet?.balance === undefined}
                animatedValueFormat={(value) => `${formatAmount(value)}zł`}
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
                    paddingTop: 200,
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            >
                {order.map((key) => {
                    if (!enabled[key]) return null
                    const def = WIDGETS.find((w) => w.key === key)
                    if (!def) return null
                    const Widget = def.component
                    return <Widget key={key} />
                })}
            </Animated.ScrollView>
        </SafeAreaView>
    )
}
