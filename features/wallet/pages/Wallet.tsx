import Header, { HeaderItem } from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeOut } from "react-native-reanimated"
import InitializeWallet from "../components/Wallet/InitializeWallet"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import WalletList2 from "../components/Wallet/WalletList2"
import WalletLoader from "../components/Wallet/WalletLoader"
import { useWalletContext } from "../components/WalletContext"
import useGetWallet from "../hooks/useGetWallet"
import { WalletScreens } from "../Main"
import { SafeAreaView } from "react-native-safe-area-context"

const styles = StyleSheet.create({
    container: {
        padding: 10,
        justifyContent: "center",
    },

    title: {
        fontSize: 60,
        fontWeight: "bold",
        textAlign: "center",
        color: Colors.foreground,
        letterSpacing: 1,
    },
    expense_item: {
        height: 80,
        borderRadius: 5,
        padding: 5,
        flexDirection: "row",
    },
    recentText: {
        color: "#7f7f7f",
        fontSize: 25,
        fontWeight: "bold",
        marginTop: 10,
    },
    overlay: {
        backgroundColor: Colors.primary,
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 125,
    },
    balance: { color: "rgba(255,255,255,0.6)", fontSize: 16, textAlign: "center", opacity: 0.8 },
})

export default function WalletScreen({ navigation, route }: WalletScreens<"Wallet">) {
    const { data, loading, refetch, onEndReached, error } = useGetWallet()
    const wallet = useWalletContext()

    const [scrollY, onScroll] = useTrackScroll({ screenName: "WalletScreens" })

    useEffect(() => {
        if (route.params?.expenseId && data?.wallet) {
            const expense = data.wallet.expenses.find((expense) => expense.id === route.params?.expenseId)
            navigation.navigate("Expense", { expense })
        }
    }, [route.params?.expenseId])

    const balance = loading && data?.wallet?.balance === undefined ? " ..." : (data?.wallet?.balance || 0).toFixed(2)

    const handleShowEditSheet = useCallback(() => {
        Haptic.trigger("impactMedium")
        navigation.navigate("EditBalance")
    }, [])

    const [showSubscriptionsView, setShowSubscriptionsView] = useState(false)

    useScreenSearch(
        useCallback((value) => {
            wallet.dispatch({ type: "SET_QUERY", payload: value.trim() })
            console.log("Search query set to:", value)
        }, []),
    )

    const buttons = useMemo(
        () =>
            [
                {
                    standalone: true,
                    icon: <Entypo name="dots-three-vertical" size={20} color={Colors.foreground} />,
                    onPress: () => {},
                    contextMenu: {
                        items: [
                            {
                                title: showSubscriptionsView ? "Show Expenses" : "Show Subscriptions",
                                systemImage: showSubscriptionsView ? "list.bullet" : "repeat",
                                onPress: () => {
                                    setShowSubscriptionsView((prev) => !prev)
                                    Haptic.trigger("impactLight")
                                },
                            },
                            {
                                title: "Edit Balance",
                                systemImage: "pencil.and.outline",
                                onPress: handleShowEditSheet,
                            },
                            {
                                title: "Filters",
                                systemImage: "line.horizontal.3.decrease.circle",
                                onPress: () => navigation.navigate("Filters"),
                            },
                        ],
                    },
                },

                {
                    onPress: () => navigation.navigate("Charts"),
                    icon: <Ionicons name="stats-chart" size={20} color={Colors.foreground} />,
                },
                {
                    onPress: () => navigation.navigate("CreateExpense"),
                    icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                },
            ] as HeaderItem[],
        [showSubscriptionsView, handleShowEditSheet],
    )

    const header = useMemo(() => {
        return (
            <Header
                scrollY={scrollY}
                animated={true}
                buttons={buttons}
                goBack={false}
                animatedValue={parseFloat(balance)}
                animatedValueLoading={loading && data?.wallet?.balance === undefined}
                animatedValueFormat={(value) => `${value.toFixed(2)}zł`}
                animatedSubtitle="Current Balance (zł)"
                onAnimatedTitleLongPress={handleShowEditSheet}
            />
        )
    }, [balance, loading, buttons])

    if (
        (Array.isArray(error?.cause?.extensions)
            ? (error as any)?.cause?.extensions?.[0]?.response?.statusCode
            : (error as any)?.cause?.extensions?.response?.statusCode) === 404
    )
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <InitializeWallet />
            </SafeAreaView>
        )

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading && (
                <Animated.View
                    exiting={FadeOut.duration(250).delay(250)}
                    style={[StyleSheet.absoluteFillObject, styles.overlay]}
                >
                    <WalletLoader />
                </Animated.View>
            )}

            {header}

            <WalletList2
                refetch={refetch}
                onScroll={onScroll}
                wallet={data?.wallet}
                onEndReached={onEndReached}
                showSubscriptions={showSubscriptionsView}
                showExpenses={!showSubscriptionsView}
            />
        </SafeAreaView>
    )
}
