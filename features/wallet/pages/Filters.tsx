import Input from "@/components/ui/TextInput/TextInput"
import { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { useWalletContext, type Action, type Filters } from "../components/WalletContext"
import DatePicker from "@/components/DatePicker"
import { formatDate } from "@/utils/functions/parseDate"
import CategorySelect from "../components/CreateExpense/CategorySelect"
import Colors from "@/constants/Colors"
import { router, useNavigation } from "expo-router"
import Header from "@/components/ui/Header/Header"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import { CategoryUtils } from "../components/Expense/ExpenseIcon"
import { AnimatedSelector, ModalHeader } from "@/components"
import dayjs from "dayjs"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import GroupSelector from "@/components/ui/GroupSelector"

interface ExpenseFiltersProps {
    filters: Filters
    dispatch: (action: Action) => void
}

export default function ExpenseFiltersSheet() {
    const { filters, dispatch } = useWalletContext()
    return <Forms filters={filters} dispatch={dispatch} />
}

const Forms = (props: ExpenseFiltersProps) => {
    const onQueryTextChange = (text: string) => {
        props.dispatch({ type: "SET_QUERY", payload: text })
    }

    const navigation = useNavigation()

    const [localQuery, setLocalQuery] = useState<string>(props.filters.query || "")

    useEffect(() => {
        if (localQuery !== props.filters.query) {
            let timeout = setTimeout(() => {
                onQueryTextChange(localQuery)
            }, 500)

            return () => {
                clearTimeout(timeout)
            }
        }
    }, [localQuery])

    const quickDates = useMemo(() => [{ label: "Today", value: [dayjs().format("YYYY-MM-DD")] }], [])

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    return (
        <View style={{ flex: 1, height: "100%" }}>
            <ModalHeader
                title="Filters"
                onClose={router.back}
                saveLabel="Clear"
                onSave={() => {
                    props.dispatch({ type: "RESET" })
                    router.back()
                }}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                onScroll={onScroll}
                style={{
                    flex: 1,
                    padding: 15,
                }}
            >
                <Input
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    placeholder="Search for a transaction"
                    placeholderTextColor="gray"
                />

                <View
                    style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                    }}
                >
                    <Input
                        keyboardAppearance="dark"
                        keyboardType="numeric"
                        name="amount.from"
                        label="Min spent"
                        value={props.filters.amount.min.toString()}
                        placeholder="From"
                        containerStyle={{ flex: 1 }}
                        right={
                            <Text variant="body" style={{ color: Colors.foreground }}>
                                zł
                            </Text>
                        }
                        style={{ textAlign: "center" }}
                        onChangeText={(text) =>
                            props.dispatch({
                                type: "SET_AMOUNT_MIN",
                                payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
                            })
                        }
                    />
                    <Text
                        variant="body"
                        style={{
                            color: "gray",
                            alignSelf: "center",
                            marginHorizontal: 10,
                            marginTop: 15,
                        }}
                    >
                        to
                    </Text>
                    <Input
                        right={
                            <Text variant="body" style={{ color: Colors.foreground }}>
                                zł
                            </Text>
                        }
                        keyboardAppearance="dark"
                        keyboardType="numeric"
                        name="amount.to"
                        label="Max spent"
                        value={props.filters.amount.max.toString()}
                        placeholder="to"
                        containerStyle={{ flex: 1 }}
                        style={{ textAlign: "center" }}
                        onChangeText={(text) =>
                            props.dispatch({
                                type: "SET_AMOUNT_MAX",
                                payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
                            })
                        }
                    />
                </View>

                <ChooseDateRange dispatch={props.dispatch} filters={props.filters} />

                <Input.Label text="Type" error={false} labelStyle={{ marginTop: 15 }} />

                <GroupSelector
                    options={[
                        { label: "All", value: undefined },
                        { label: "Income", value: "income" },
                        { label: "Expense", value: "expense" },
                        { label: "Refunded", value: "refunded" },
                    ]}
                    onChange={(value) => {
                        if (value === "all") {
                            props.dispatch({ type: "SET_TYPE", payload: undefined })
                            return
                        }
                        props.dispatch({ type: "SET_TYPE", payload: value })
                    }}
                    value={props.filters.type || "all"}
                />

                <Input.Label text="Category" error={false} labelStyle={{ marginBottom: 10 }} />

                <CategorySelect
                    maxSelectHeight={250}
                    multiSelect
                    closeOnSelect={false}
                    selected={
                        Array.isArray(props?.filters?.category) ? props?.filters?.category : [props?.filters?.category]
                    }
                    setSelected={(selected) => {
                        props.dispatch({ type: "SET_CATEGORY", payload: selected.map(CategoryUtils.getCategoryParent) })
                    }}
                    isActive={(category) => props.filters.category.includes(category)}
                />
            </Animated.ScrollView>
        </View>
    )
}

const ChooseDateRange = (props: { filters: Filters; dispatch: (action: Action) => void }) => {
    const fromDate = props.filters.date.from ? new Date(props.filters.date.from) : new Date()
    const toDate = props.filters.date.to ? new Date(props.filters.date.to) : new Date()

    return (
        <View style={{ marginTop: 15 }}>
            <Input.Label text="Date range" error={false} />
            <View
                style={{
                    flexDirection: "row",
                    gap: 10,
                    marginTop: 5,
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <DatePicker
                    mode="single"
                    placeholder={props.filters.date.from || "Date start"}
                    dates={{ start: fromDate, end: fromDate }}
                    setDates={({ start }) => props.dispatch({ type: "SET_DATE_MIN", payload: formatDate(start) })}
                />
                <Text variant="body" style={{ color: "gray" }}>
                    to
                </Text>
                <DatePicker
                    mode="single"
                    placeholder={props.filters.date.to || "Date end"}
                    dates={{ start: toDate, end: toDate }}
                    setDates={({ start }) => props.dispatch({ type: "SET_DATE_MAX", payload: formatDate(start) })}
                />
            </View>
        </View>
    )
}
