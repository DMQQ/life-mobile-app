import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useCallback, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Background from "@/components/ui/Background"
import { SafeAreaView } from "react-native-safe-area-context"
import ExpensesList from "../components/Wallet/ExpensesList"
import SubscriptionsList from "../components/Wallet/SubscriptionsList"
import { useWalletContext } from "../components/WalletContext"
import useGetWallet from "../hooks/useGetWallet"
import { router } from "expo-router"
import { Icons, CategoryUtils } from "../components/Expense/ExpenseIcon"
import dayjs from "dayjs"
import { Wallet } from "@/types"
import Text from "@/components/ui/Text/Text"
import Haptic from "react-native-haptic-feedback"
import GlassView from "@/components/ui/GlassView"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { Menu, Button, Toggle, Section, Divider, Host } from "@expo/ui/swift-ui"

const categoryIconMap: Record<string, string> = {
    housing: "house.fill",
    transportation: "car.fill",
    food: "fork.knife",
    drinks: "mug.fill",
    shopping: "cart.fill",
    addictions: "smoke.fill",
    work: "briefcase.fill",
    clothes: "tshirt.fill",
    health: "pills.fill",
    entertainment: "play.rectangle.fill",
    utilities: "bolt.fill",
    debt: "creditcard.fill",
    education: "book.fill",
    savings: "banknote.fill",
    travel: "airplane",
    animals: "pawprint.fill",
    gifts: "gift.fill",
}

type Tab = "expenses" | "subscriptions"

export default function ExpensesListScreen() {
    const { data, refetch, onEndReached } = useGetWallet()
    const [scrollY, onScroll] = useTrackScroll({ screenName: "ExpensesListScreen" })
    const [tab, setTab] = useState<Tab>("expenses")

    const handleTabChange = useCallback((next: Tab) => {
        Haptic.trigger("impactLight")
        setTab(next)
    }, [])

    const header = useMemo(
        () => (
            <Header
                containerStyle={{ justifyContent: "flex-end" }}
                scrollY={scrollY}
                animated={true}
                goBack={false}
                buttons={[
                    {
                        icon: "plus",
                        onPress: () => router.push("/(tabs)/wallet/create-expense"),
                    },
                ]}
                animatedTitle={tab === "expenses" ? "Expenses" : "Subscriptions"}
                animatedSubtitle={tab === "expenses" ? "All transactions" : "Recurring payments"}
            />
        ),
        [tab],
    )

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Background />
            {header}
            {tab === "expenses" ? (
                <ExpensesList
                    wallet={data?.wallet as unknown as Wallet}
                    onScroll={onScroll}
                    refetch={refetch}
                    onEndReached={onEndReached}
                />
            ) : (
                <SubscriptionsList onScroll={onScroll} />
            )}
            <BottomSearchBar />
        </SafeAreaView>
    )
}

const BottomSearchBar = () => {
    const { filters, dispatch, hasFilters } = useWalletContext()
    const { height } = useReanimatedKeyboardAnimation()
    const [query, setQuery] = useState("")

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: height.value }],
    }))

    const handleChangeText = useCallback(
        (text: string) => {
            setQuery(text)
            dispatch({ type: "SET_QUERY", payload: text.trim() })
        },
        [dispatch],
    )

    const categories = useMemo(
        () => Object.keys(Icons).filter((key) => !["edit", "income"].includes(key)) as (keyof typeof Icons)[],
        [],
    )

    const typeLabel = filters.type ? filters.type.charAt(0).toUpperCase() + filters.type.slice(1) : "All"
    const hasTypeFilter = filters.type !== undefined

    const hasDateFilter = !!(filters.date.from || filters.date.to)
    const dateLabel = hasDateFilter
        ? `${dayjs(filters.date.from).format("MMM D")} – ${dayjs(filters.date.to).format("MMM D")}`
        : "All Time"

    const hasCategoryFilter = filters.category.length > 0
    const categoryLabel = hasCategoryFilter ? `${filters.category.length} selected` : "Categories"

    return (
        <Animated.View style={[searchBarStyles.wrapper, animatedStyle]}>
            <GlassView style={searchBarStyles.glass}>
                <View style={searchBarStyles.bar}>
                    <Feather name="search" size={18} color={Colors.foreground_secondary} />
                    <TextInput
                        style={searchBarStyles.input}
                        placeholder="Search expenses..."
                        placeholderTextColor={Colors.text_dark}
                        value={query}
                        onChangeText={handleChangeText}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => handleChangeText("")} hitSlop={8}>
                            <Feather name="x" size={16} color={Colors.foreground_secondary} />
                        </Pressable>
                    )}
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={searchBarStyles.pillsRow}
                    contentContainerStyle={searchBarStyles.pillsContent}
                    keyboardShouldPersistTaps="always"
                >
                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <GlassView
                                    style={searchBarStyles.pill}
                                    tintColor={hasTypeFilter ? Colors.secondary : undefined}
                                >
                                    <Feather
                                        name="tag"
                                        size={13}
                                        color={hasTypeFilter ? Colors.foreground : Colors.foreground_secondary}
                                    />
                                    <Text
                                        style={[
                                            searchBarStyles.pillText,
                                            hasTypeFilter && searchBarStyles.pillTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {typeLabel}
                                    </Text>
                                </GlassView>
                            }
                        >
                            <Button label="All" onPress={() => dispatch({ type: "SET_TYPE", payload: undefined })} />
                            <Button
                                label="Income"
                                systemImage="arrow.down.circle"
                                onPress={() => dispatch({ type: "SET_TYPE", payload: "income" })}
                            />
                            <Button
                                label="Expense"
                                systemImage="arrow.up.circle"
                                onPress={() => dispatch({ type: "SET_TYPE", payload: "expense" })}
                            />
                            <Button
                                label="Refunded"
                                systemImage="arrow.uturn.backward.circle"
                                onPress={() => dispatch({ type: "SET_TYPE", payload: "refunded" })}
                            />
                        </Menu>
                    </Host>

                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <GlassView
                                    style={searchBarStyles.pill}
                                    tintColor={hasDateFilter ? Colors.secondary : undefined}
                                >
                                    <Feather
                                        name="calendar"
                                        size={13}
                                        color={hasDateFilter ? Colors.foreground : Colors.foreground_secondary}
                                    />
                                    <Text
                                        style={[
                                            searchBarStyles.pillText,
                                            hasDateFilter && searchBarStyles.pillTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {dateLabel}
                                    </Text>
                                </GlassView>
                            }
                        >
                            <Button
                                label="Today"
                                systemImage="calendar.badge.clock"
                                onPress={() => {
                                    const today = dayjs().format("YYYY-MM-DD")
                                    dispatch({ type: "SET_DATE_MIN", payload: today })
                                    dispatch({ type: "SET_DATE_MAX", payload: today })
                                }}
                            />
                            <Button
                                label="This Week"
                                systemImage="calendar.badge.plus"
                                onPress={() => {
                                    dispatch({
                                        type: "SET_DATE_MIN",
                                        payload: dayjs().startOf("week").format("YYYY-MM-DD"),
                                    })
                                    dispatch({
                                        type: "SET_DATE_MAX",
                                        payload: dayjs().endOf("week").format("YYYY-MM-DD"),
                                    })
                                }}
                            />
                            <Button
                                label="This Month"
                                systemImage="calendar"
                                onPress={() => {
                                    dispatch({
                                        type: "SET_DATE_MIN",
                                        payload: dayjs().startOf("month").format("YYYY-MM-DD"),
                                    })
                                    dispatch({
                                        type: "SET_DATE_MAX",
                                        payload: dayjs().endOf("month").format("YYYY-MM-DD"),
                                    })
                                }}
                            />
                            <Divider />
                            <Button
                                label="Clear Date"
                                role="destructive"
                                onPress={() => {
                                    dispatch({ type: "SET_DATE_MIN", payload: "" })
                                    dispatch({ type: "SET_DATE_MAX", payload: "" })
                                }}
                            />
                        </Menu>
                    </Host>

                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <View style={[searchBarStyles.pill, hasCategoryFilter && searchBarStyles.pillActive]}>
                                    <Feather
                                        name="grid"
                                        size={13}
                                        color={hasCategoryFilter ? Colors.foreground : Colors.foreground_secondary}
                                    />
                                    <Text
                                        style={[
                                            searchBarStyles.pillText,
                                            hasCategoryFilter && searchBarStyles.pillTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {categoryLabel}
                                    </Text>
                                </View>
                            }
                        >
                            <Section title="Categories">
                                {categories.map((category) => (
                                    <Toggle
                                        key={category}
                                        label={CategoryUtils.getCategoryName(category)}
                                        systemImage={categoryIconMap[category] as any}
                                        isOn={filters.category.includes(category)}
                                        onIsOnChange={() => dispatch({ type: "TOGGLE_CATEGORY", payload: category })}
                                    />
                                ))}
                            </Section>
                        </Menu>
                    </Host>

                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <View style={searchBarStyles.pill}>
                                    <Feather name="more-horizontal" size={13} color={Colors.foreground_secondary} />
                                </View>
                            }
                        >
                            <Button
                                label="Advanced Filters"
                                systemImage="slider.horizontal.3"
                                onPress={() => router.push("/(tabs)/wallet/filters")}
                            />
                            {hasFilters && (
                                <>
                                    <Divider />
                                    <Button
                                        label="Clear All Filters"
                                        role="destructive"
                                        onPress={() => {
                                            dispatch({ type: "RESET" })
                                            handleChangeText("")
                                        }}
                                    />
                                </>
                            )}
                        </Menu>
                    </Host>
                </ScrollView>
            </GlassView>
        </Animated.View>
    )
}

const searchBarStyles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 15,
        left: 15,
        right: 15,
        gap: 8,
    },
    glass: {
        borderRadius: 35,
        paddingTop: 5,
        overflow: "hidden",
    },
    pillsRow: {
        paddingHorizontal: 15,
        height: 40,
        flexGrow: 0,
    },
    pillsContent: {
        gap: 7.5,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        overflow: "hidden",
    },
    pillText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.foreground_secondary,
    },
    pillTextActive: {
        color: Colors.foreground,
    },
    bar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 100,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 20,
        overflow: "hidden",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.foreground,
        paddingVertical: 10,
    },
})
