import { FONTS } from "@/constants/Fonts"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { Feather } from "@expo/vector-icons"
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Background from "@/components/ui/Background"
import { SafeAreaView } from "react-native-safe-area-context"
import ExpensesList from "../components/Wallet/ExpensesList"
import { useWalletContext } from "../components/WalletContext"
import useGetWallet from "../hooks/useGetWallet"
import { useSubAccounts } from "../hooks/useSubAccounts"
import { WalletScreens } from "../Main"
import { Icons, CategoryUtils } from "../components/Expense/ExpenseIcon"
import dayjs from "dayjs"
import { Wallet } from "@/types"
import Text from "@/components/ui/Text/Text"
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

export default function ExpensesListScreen({ navigation, route }: WalletScreens<"ExpensesList">) {
    const initialFilters = route.params?.filters
    const { data, refetch, onEndReached } = useGetWallet()
    const { hasFilters, filtersDiffCount, dispatch } = useWalletContext()
    const [scrollY, onScroll] = useTrackScroll({ screenName: "ExpensesListScreen" })
    const [visibleMonth, setVisibleMonth] = useState<string | null>(null)

    useLayoutEffect(() => {
        if (!initialFilters) return
        if (initialFilters.accountId !== undefined) {
            dispatch({ type: "SET_ACCOUNT_ID", payload: initialFilters.accountId })
        }
        if (initialFilters.type !== undefined) {
            dispatch({ type: "SET_TYPE", payload: initialFilters.type })
        }
        if (initialFilters.category?.length) {
            dispatch({ type: "SET_CATEGORY", payload: initialFilters.category })
        }
        if (initialFilters.date?.from) {
            dispatch({ type: "SET_DATE_MIN", payload: initialFilters.date.from })
        }
        if (initialFilters.date?.to) {
            dispatch({ type: "SET_DATE_MAX", payload: initialFilters.date.to })
        }
        if (initialFilters.shopName !== undefined) {
            dispatch({ type: "SET_SHOP_NAME", payload: initialFilters.shopName })
        }
    }, [])

    const header = useMemo(
        () => (
            <Header
                containerStyle={{ justifyContent: "flex-end" }}
                scrollY={scrollY}
                animated={false}
                goBack={true}
                buttons={[
                    {
                        badge: filtersDiffCount,
                        badgeColor: Colors.secondary,
                        icon: "line.3.horizontal.decrease",
                        tintColor: hasFilters ? Colors.secondary : "#fff",
                        onPress: () => navigation.navigate("Filters"),
                    },
                    {
                        icon: "plus",
                        onPress: () => navigation.navigate("CreateExpense"),
                    },
                ]}
                title={visibleMonth ? dayjs(visibleMonth).format("MMMM YYYY") : "Expenses"}
            />
        ),
        [hasFilters, filtersDiffCount, visibleMonth],
    )

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Background />
            {header}

            <ExpensesList
                wallet={data?.wallet as unknown as Wallet}
                onScroll={onScroll}
                refetch={refetch}
                onEndReached={onEndReached}
                onVisibleMonthChange={setVisibleMonth}
            />
            <BottomSearchBar navigation={navigation} />
        </SafeAreaView>
    )
}

const TIME_PRESETS: { label: string; systemImage: any; from: string; to: string }[] = [
    { label: "Morning", systemImage: "sunrise.fill", from: "06:00", to: "12:00" },
    { label: "Afternoon", systemImage: "sun.max.fill", from: "12:00", to: "18:00" },
    { label: "Evening", systemImage: "sunset.fill", from: "18:00", to: "24:00" },
    { label: "Night", systemImage: "moon.fill", from: "00:00", to: "06:00" },
]

const BottomSearchBar = ({ navigation }: Omit<WalletScreens<"ExpensesList">, "route">) => {
    const { filters, dispatch, hasFilters } = useWalletContext()
    const { height } = useReanimatedKeyboardAnimation()
    const [query, setQuery] = useState("")
    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet?.subAccounts ?? []

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

    const hasSubAccountFilter = !!filters.accountId
    const selectedSubAccount = subAccounts.find((sa) => sa.id === filters.accountId)
    const subAccountLabel = selectedSubAccount?.name ?? "Account"

    const hasTimeFilter = !!(filters.time?.from || filters.time?.to)
    const activeTimePreset = TIME_PRESETS.find((p) => p.from === filters.time?.from && p.to === filters.time?.to)
    const timeLabel = activeTimePreset?.label ?? (hasTimeFilter ? `${filters.time?.from}–${filters.time?.to}` : "Time")

    const hasScheduledFilter = filters.scheduled !== undefined
    const scheduledLabel =
        filters.scheduled === true ? "Scheduled" : filters.scheduled === false ? "Not Scheduled" : "Scheduled"

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
                                <View style={searchBarStyles.pill}>
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
                                </View>
                            }
                        >
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
                            <Divider />
                            <Button label="All" onPress={() => dispatch({ type: "SET_TYPE", payload: undefined })} />
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
                                <View style={[searchBarStyles.pill]}>
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

                    {subAccounts.length > 0 && (
                        <Host style={{ height: 35 }}>
                            <Menu
                                label={
                                    <GlassView
                                        style={searchBarStyles.pill}
                                        tintColor={hasSubAccountFilter ? Colors.secondary : undefined}
                                    >
                                        <Feather
                                            name="credit-card"
                                            size={13}
                                            color={
                                                hasSubAccountFilter ? Colors.foreground : Colors.foreground_secondary
                                            }
                                        />
                                        <Text
                                            style={[
                                                searchBarStyles.pillText,
                                                hasSubAccountFilter && searchBarStyles.pillTextActive,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {subAccountLabel}
                                        </Text>
                                    </GlassView>
                                }
                            >
                                <Button
                                    label="All Accounts"
                                    onPress={() => dispatch({ type: "SET_ACCOUNT_ID", payload: undefined })}
                                />
                                <Section title="Sub-accounts">
                                    {subAccounts.map((sa) => (
                                        <Toggle
                                            key={sa.id}
                                            label={sa.name}
                                            isOn={filters.accountId === sa.id}
                                            onIsOnChange={() =>
                                                dispatch({
                                                    type: "SET_ACCOUNT_ID",
                                                    payload: filters.accountId === sa.id ? undefined : sa.id,
                                                })
                                            }
                                        />
                                    ))}
                                </Section>
                            </Menu>
                        </Host>
                    )}

                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <GlassView
                                    style={searchBarStyles.pill}
                                    tintColor={hasTimeFilter ? Colors.secondary : undefined}
                                >
                                    <Feather
                                        name="clock"
                                        size={13}
                                        color={hasTimeFilter ? Colors.foreground : Colors.foreground_secondary}
                                    />
                                    <Text
                                        style={[
                                            searchBarStyles.pillText,
                                            hasTimeFilter && searchBarStyles.pillTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {timeLabel}
                                    </Text>
                                </GlassView>
                            }
                        >
                            {TIME_PRESETS.map((preset) => (
                                <Button
                                    key={preset.label}
                                    label={`${preset.label} (${preset.from}–${preset.to})`}
                                    systemImage={preset.systemImage}
                                    onPress={() => {
                                        dispatch({ type: "SET_TIME_FROM", payload: preset.from })
                                        dispatch({ type: "SET_TIME_TO", payload: preset.to })
                                    }}
                                />
                            ))}
                            {hasTimeFilter && (
                                <>
                                    <Divider />
                                    <Button
                                        label="Clear Time"
                                        role="destructive"
                                        onPress={() => {
                                            dispatch({ type: "SET_TIME_FROM", payload: "" })
                                            dispatch({ type: "SET_TIME_TO", payload: "" })
                                        }}
                                    />
                                </>
                            )}
                        </Menu>
                    </Host>

                    <Host style={{ height: 35 }}>
                        <Menu
                            label={
                                <GlassView
                                    style={searchBarStyles.pill}
                                    tintColor={hasScheduledFilter ? Colors.secondary : undefined}
                                >
                                    <Feather
                                        name="repeat"
                                        size={13}
                                        color={hasScheduledFilter ? Colors.foreground : Colors.foreground_secondary}
                                    />
                                    <Text
                                        style={[
                                            searchBarStyles.pillText,
                                            hasScheduledFilter && searchBarStyles.pillTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {scheduledLabel}
                                    </Text>
                                </GlassView>
                            }
                        >
                            <Button
                                label="All"
                                onPress={() => dispatch({ type: "SET_SCHEDULED", payload: undefined })}
                            />
                            <Button
                                label="Scheduled only"
                                systemImage="calendar.badge.clock"
                                onPress={() => dispatch({ type: "SET_SCHEDULED", payload: true })}
                            />
                            <Button
                                label="Not scheduled"
                                systemImage="xmark.circle"
                                onPress={() => dispatch({ type: "SET_SCHEDULED", payload: false })}
                            />
                        </Menu>
                    </Host>
                </ScrollView>
            </GlassView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    filterBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: Colors.secondary,
        borderRadius: 100,
        minWidth: 14,
        height: 14,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    filterBadgeText: {
        fontSize: 9,
        fontFamily: FONTS.bold,
        color: Colors.foreground,
    },
})

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
        height: 50,
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
        paddingVertical: 6,
        borderRadius: 100,
        overflow: "hidden",
    },
    pillText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
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
