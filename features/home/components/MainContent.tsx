import AvailableBalanceWidget from "@/features/home/components/WalletWidget"
import HomeExtras from "@/features/home/components/HomeExtras"
import TimelineWidget from "@/features/home/components/TimelineWidget"
import { RefreshControl } from "react-native"
import Animated from "react-native-reanimated"

interface MainContentProps {
    home: any
    loading: boolean
    refreshing: boolean
    refresh: () => void
    onScroll: (event: any) => void
}

export default function MainContent({ home, loading, refreshing, refresh, onScroll }: MainContentProps) {
    return (
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
                paddingTop: 300,
                gap: 10,
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        >
            <AvailableBalanceWidget
                data={{
                    wallet: home?.wallet,
                    statistics: home?.monthlySpendings,
                    lastMonthSpendings: home?.lastMonthSpendings,
                }}
                loading={loading}
            />
            <TimelineWidget />
            <HomeExtras />
        </Animated.ScrollView>
    )
}
