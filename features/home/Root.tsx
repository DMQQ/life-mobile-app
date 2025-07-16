import Header from "@/components/ui/Header/Header"
import { ScreenProps } from "@/types"
import RefreshContextProvider, { useRefresh } from "@/utils/context/RefreshContext"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import useAppBackground from "@/utils/hooks/useAppBackground"
import useOffline from "@/utils/hooks/useOffline"
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useQuery } from "@apollo/client"
import * as SplashScreen from "expo-splash-screen"
import moment from "moment"
import { useState } from "react"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useGetNotifications } from "../wallet/components/Wallet/WalletNotifications"
import HeaderActions from "./components/HeaderActions"
import LoadingSkeleton from "./components/LoadingSkeleton"
import MainContent from "./components/MainContent"
import NotificationsModal from "./components/NotificationsModal"
import SettingsModal from "./components/SettingsModal"



function Root({}: ScreenProps<"Root">) {
    const offline = useOffline("RootScreen")
    const [loading, setLoading] = useState(true)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
        variables: {
            range: [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")],
            lastRange: [
                moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
                moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
            ],
        },
        onCompleted: async (data) => {
            await offline.save("RootScreen", data)
            await SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 1000)
        },
        onError: (er) => {
            console.log("Error fetching data", er)
            SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 500)
        },
    })

    const { refetch: refetchNotifications } = useGetNotifications()
    const data = offline.isOffline ? offline.data || {} : home
    const { refreshing, refresh } = useRefresh([refetchHome, refetchNotifications], [])
    const [scrollY, onScroll] = useTrackScroll()

    useAppBackground({ onForeground: refresh })

    // Calculate spending trend
    const trendPercentage = home?.lastMonthSpendings?.expense
        ? ((home?.monthlySpendings?.expense - home?.lastMonthSpendings?.expense) / home?.lastMonthSpendings?.expense) * 100
        : 0
    const isIncreasing = trendPercentage > 0

    const headerButtons = HeaderActions({
        onNotificationPress: () => setShowNotifications(true),
        onSettingsPress: () => setShowSettings(true),
    })

    return (
        <Animated.View style={{ flex: 1 }} layout={LinearTransition.delay(100)}>
            {loading && <LoadingSkeleton />}
            
            <Header
                goBack={false}
                animatedValue={parseFloat(home?.monthlySpendings?.expense || 0)}
                animatedValueLoading={loading && data?.wallet?.balance === undefined}
                animatedValueFormat={(value) => `${value?.toFixed(2)}zł`}
                animatedSubtitle={`This month spendings, ${Math.abs(trendPercentage).toFixed(1)}% ${isIncreasing ? "more" : "less"} vs last month`}
                scrollY={scrollY}
                animated={true}
                buttons={headerButtons}
            />

            <MainContent
                data={data}
                home={home}
                loading={loading}
                refreshing={refreshing}
                refresh={refresh}
                onScroll={onScroll}
            />

            <NotificationsModal
                visible={showNotifications}
                onClose={() => setShowNotifications(false)}
            />

            <SettingsModal
                visible={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </Animated.View>
    )
}

export default function RootScreen(props: ScreenProps<"Root">) {
    return (
        <RefreshContextProvider>
            <Root {...props} />
        </RefreshContextProvider>
    )
}
