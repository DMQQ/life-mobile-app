import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeOut, SharedValue } from "react-native-reanimated"
import AnimatedHeaderSearch from "../../../components/ui/Header/AnimatedHeaderSearch"
import EditBalanceSheet from "../components/Wallet/EditBalanceSheet"
import InitializeWallet from "../components/Wallet/InitializeWallet"
import WalletList2 from "../components/Wallet/WalletList2"
import WalletLoader from "../components/Wallet/WalletLoader"
import { useWalletContext } from "../components/WalletContext"
import useGetWallet from "../hooks/useGetWallet"
import { WalletScreens } from "../Main"

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
        Haptic.trigger("impactMedium")
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
                icon: <Feather name="repeat" size={20} color={Colors.foreground} />,
            },

            {
                onPress: () => navigation.navigate("Charts"),
                icon: <Ionicons name="stats-chart" size={20} color={Colors.foreground} />,
            },
            {
                onPress: () => navigation.navigate("CreateExpense"),
                icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
            },
        ],
        [],
    )

    const renderAnimatedItem = useCallback(
        ({ scrollY }: { scrollY: SharedValue<number> | undefined }) => <WalletSearch scrollY={scrollY} />,
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

            <WalletList2
                refetch={refetch}
                onScroll={onScroll}
                wallet={data?.wallet}
                onEndReached={onEndReached}
                showSubscriptions={showSubscriptionsView}
                showExpenses={!showSubscriptionsView}
            />

            <EditBalanceSheet />
        </View>
    )
}

interface AnimatedHeaderSearchProps {
    scrollY?: SharedValue<number>
}

const WalletSearch = ({ scrollY }: AnimatedHeaderSearchProps) => {
    const wallet = useWalletContext()
    const navigation = useNavigation<any>()

    return (
        <AnimatedHeaderSearch
            buttonsCount={3}
            onFiltersPress={() => navigation.navigate("Filters")}
            scrollY={scrollY}
            filterValue={wallet.filters.query}
            setFilterValue={(v) => wallet.dispatch({ type: "SET_QUERY", payload: v.trim() })}
        />
    )
}
