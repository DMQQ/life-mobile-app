import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import Animated, { FadeOut, SharedValue } from "react-native-reanimated"
import { WalletScreens } from "../Main"
import SubscriptionList from "../components/Subscription/SubscriptionList"
import AnimatedHeaderSearch from "../components/Wallet/AnimatedHeaderSearch"
import EditBalanceSheet from "../components/Wallet/EditBalanceSheet"
import InitializeWallet from "../components/Wallet/InitializeWallet"
import WalletList from "../components/Wallet/WalletList"
import WalletLoader from "../components/Wallet/WalletLoader"
import { useWalletContext } from "../components/WalletContext"
import useGetWallet from "../hooks/useGetWallet"

const styles = StyleSheet.create({
    container: {
        padding: 10,
        justifyContent: "center",
    },

    title: {
        fontSize: 60,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff",
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
    const { data, loading, refetch, onEndReached, endReached, filtersActive, error } = useGetWallet()

    const {
        refs: { bottomSheetRef, editBalanceRef },
    } = useWalletContext()

    const [scrollY, onScroll] = useTrackScroll()

    useEffect(() => {
        if (route.params?.expenseId && data?.wallet) {
            const expense = data.wallet.expenses.find((expense) => expense.id === route.params?.expenseId)
            navigation.navigate("Expense", { expense })
        }
    }, [route.params?.expenseId])

    const balance = loading && data?.wallet?.balance === undefined ? " ..." : (data?.wallet?.balance || 0).toFixed(2)

    const handleShowEditSheet = () => {
        editBalanceRef.current?.expand()
    }

    const [showSubscriptionsView, setShowSubscriptionsView] = useState(false)

    const buttons = useMemo(
        () => [
            {
                onPress: () => {
                    setShowSubscriptionsView((p) => {
                        const newValue = !p

                        bottomSheetRef.current?.snapToIndex(showSubscriptionsView ? -1 : 0)

                        return newValue
                    })
                },
                icon: <FontAwesome name="exchange" size={20} color="#fff" />,
            },

            {
                onPress: () => navigation.navigate("Charts"),
                icon: <Ionicons name="stats-chart" size={20} color="#fff" />,
            },
            {
                onPress: () => navigation.navigate("CreateExpense"),
                icon: <AntDesign name="plus" size={20} color="#fff" />,
            },
        ],
        [],
    )

    const renderAnimatedItem = useCallback(
        ({ scrollY }: { scrollY: SharedValue<number> | undefined }) => <AnimatedHeaderSearch scrollY={scrollY} />,
        [],
    )

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
        <View style={{ flex: 1 }}>
            {loading && (
                <Animated.View exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFillObject, styles.overlay]}>
                    <WalletLoader />
                </Animated.View>
            )}

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
                renderAnimatedItem={renderAnimatedItem}
            />

            {showSubscriptionsView ? (
                <SubscriptionList onScroll={onScroll} scrollY={scrollY} />
            ) : (
                <WalletList
                    filtersActive={filtersActive}
                    isLocked={loading || !data || endReached}
                    refetch={refetch}
                    scrollY={scrollY}
                    onScroll={onScroll}
                    wallet={data?.wallet}
                    onEndReached={onEndReached}
                />
            )}

            <EditBalanceSheet />
        </View>
    )
}
