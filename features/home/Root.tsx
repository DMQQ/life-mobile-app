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
import { useMemo, useState } from "react"
import { View } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { FloatingNotifications, useGetNotifications } from "../wallet/components/Wallet/WalletNotifications"
import LoadingSkeleton from "./components/LoadingSkeleton"
import MainContent from "./components/MainContent"
import NotificationsModal from "./components/NotificationsModal"
import SettingsModal from "./components/SettingsModal"
import useWidgets from "@/utils/widget/hooks/useWidgets"
import { useActivityManager } from "@/utils/hooks/useActivityManager"

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

    const activity = useActivityManager()

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
            // {
            //     icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
            //     onPress: () => {
            //         activity.startActivity({
            //             title: "New Activity",
            //             description: "Creating a new activity from header",
            //             endTime: "23:25:00",
            //             eventId: `activity-${Date.now()}`,
            //             deepLinkURL: `mylife://timeline`,
            //             todos: [
            //                 {
            //                     id: "todo-1",
            //                     title: "First Todo",
            //                     isCompleted: false,
            //                 },
            //                 {
            //                     id: "todo-2",
            //                     title: "Second Todo",
            //                     isCompleted: true,
            //                 },
            //                 {
            //                     id: "todo-3",
            //                     title: "Third Todo",
            //                     isCompleted: false,
            //                 },
            //                 {
            //                     id: "todo-4",
            //                     title: "4 Todo",
            //                     isCompleted: true,
            //                 },
            //                 {
            //                     id: "todo-5",
            //                     title: "5 Todo",
            //                     isCompleted: false,
            //                 },
            //             ],
            //         })
            //     },
            // },
        ],
        [data?.notifications],
    )

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
