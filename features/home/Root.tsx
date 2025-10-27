import Header from "@/components/ui/Header/Header"
import PulsingIndicator from "@/components/ui/PulsingIndicator"
import Colors from "@/constants/Colors"
import { ScreenProps } from "@/types"
import RefreshContextProvider, { useRefresh } from "@/utils/context/RefreshContext"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import useAppBackground from "@/utils/hooks/useAppBackground"
import { GET_MAIN_SCREEN, getMainScreenBaseVariables } from "@/utils/schemas/GET_MAIN_SCREEN"
import { useQuery } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { FloatingNotifications, useGetNotifications } from "../wallet/components/Wallet/WalletNotifications"
import LoadingSkeleton from "./components/LoadingSkeleton"
import MainContent from "./components/MainContent"
import NotificationsModal from "./components/NotificationsModal"
import SettingsModal from "./components/SettingsModal"
import store from "@/utils/widget/store"
import { ExtensionStorage } from "@bacons/apple-targets"
import useWidgets from "@/utils/widget/hooks/useWidgets"

function Root({}: ScreenProps<"Root">) {
    const [loading, setLoading] = useState(true)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    useWidgets()

    const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
        variables: getMainScreenBaseVariables(),
        onCompleted: async (data) => {
            await SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 500)
        },
        onError: (er) => {
            SplashScreen.hideAsync()
            setTimeout(() => setLoading(false), 500)
        },
    })

    const { refetch: refetchNotifications, data } = useGetNotifications()
    const { refreshing, refresh } = useRefresh([refetchHome, refetchNotifications], [])
    const [scrollY, onScroll] = useTrackScroll({ screenName: "Root" })

    useAppBackground({ onForeground: refresh })

    // Calculate spending trend
    const trendPercentage = home?.lastMonthSpendings?.expense
        ? ((home?.monthlySpendings?.expense - home?.lastMonthSpendings?.expense) / home?.lastMonthSpendings?.expense) *
          100
        : 0
    const isIncreasing = trendPercentage > 0

    const headerButtons = useMemo(
        () => [
            {
                icon: (
                    <View style={{ position: "relative" }}>
                        <AntDesign name="bell" size={20} color={Colors.foreground} />
                        {(data?.notifications as any[])?.some((n) => !n.read) && <PulsingIndicator />}
                    </View>
                ),
                onPress: () => setShowNotifications(true),
            },
            {
                icon: <AntDesign name="setting" size={20} color={Colors.foreground} />,
                onPress: () => setShowSettings(true),
            },
        ],
        [data?.notifications],
    )

    useEffect(() => {
        store.set("test_key", "")
        ExtensionStorage.reloadWidget()
    }, [])

    return (
        <Animated.View style={{ flex: 1 }} layout={LinearTransition.delay(100)}>
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

            <MainContent
                data={home}
                home={home}
                loading={loading}
                refreshing={refreshing}
                refresh={refresh}
                onScroll={onScroll}
            />

            <NotificationsModal visible={showNotifications} onClose={() => setShowNotifications(false)} />

            <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
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
