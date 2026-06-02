import DatePicker from "@/components/DatePicker"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { SpontaneousRateChip } from "@/features/wallet/components/CreateExpense/SpontaneousRate"
import { CategoryUtils, Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment/moment"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Haptic from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated from "react-native-reanimated"
import { useSubAccounts } from "../../hooks/useSubAccounts"

export default function OptionsPicker() {
    const { state, methods } = useCreateExpenseContext()
    const { type, category, spontaneousRate, date, subAccountId } = state
    const { setDate, setView } = methods

    const { data: subAccountsData } = useSubAccounts()
    const subAccounts = subAccountsData?.wallet.subAccounts ?? []
    const selectedAccount = subAccounts.find((a) => a.id === subAccountId) ?? null

    const onPressWithFeedback = (callback: () => void) => () => {
        Haptic.trigger("impactLight")
        callback()
    }

    return (
        <Animated.ScrollView
            keyboardDismissMode="on-drag"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row" }}
            contentContainerStyle={{ gap: 10 }}
        >
            <DatePicker
                mode="single"
                dates={{ start: date ? moment(date).toDate() : new Date(), end: new Date() }}
                setDates={(dates) => {
                    setDate(dayjs(dates.start).format("YYYY-MM-DD"))
                }}
                buttonComponent={({ start, onPress }) => (
                    <Ripple
                        onPress={onPress}
                        style={[styles.chip, { backgroundColor: Colors.primary_lighter, flex: undefined, height: 45 }]}
                    >
                        <Feather name="calendar" size={15} color="rgba(255,255,255,0.7)" />
                        <Text size={14} color="rgba(255,255,255,0.7)">
                            {moment(start).format("YYYY-MM-DD")}
                        </Text>
                    </Ripple>
                )}
            />

            {type !== "income" && (
                <Ripple
                    onPress={onPressWithFeedback(() => setView("category"))}
                    style={[
                        styles.chip,
                        {
                            backgroundColor:
                                category === "none"
                                    ? Colors.primary_lighter
                                    : lowOpacity(Icons[category]?.backgroundColor, 0.2),
                            borderColor:
                                category === "none"
                                    ? styles.chip.borderColor
                                    : lowOpacity(Icons[category]?.backgroundColor, 0.2),
                        },
                    ]}
                >
                    {Icons[category]?.icon ?? null}
                    <Text
                        size={15}
                        color={
                            category === "none"
                                ? "rgba(255,255,255,0.7)"
                                : Color(Icons[category]?.backgroundColor).lighten(0.25).hex()
                        }
                    >
                        {category === "none" ? "Select category" : CategoryUtils.getCategoryName(category)}
                    </Text>
                </Ripple>
            )}

            <SpontaneousRateChip
                value={spontaneousRate}
                onPress={onPressWithFeedback(() => setView("spontaneous"))}
            />

            {subAccounts.length > 0 && (
                <Ripple
                    onPress={onPressWithFeedback(() => setView("account"))}
                    style={[
                        styles.chip,
                        {
                            backgroundColor: selectedAccount
                                ? Color(selectedAccount.color ?? Colors.primary_lighter).alpha(0.2).string()
                                : Colors.primary_lighter,
                            borderColor: selectedAccount
                                ? Color(selectedAccount.color ?? Colors.primary_lighter).alpha(0.35).string()
                                : styles.chip.borderColor,
                            gap: 8,
                        },
                    ]}
                >
                    <Feather
                        name="credit-card"
                        size={15}
                        color={selectedAccount?.color ?? "rgba(255,255,255,0.7)"}
                    />
                    <Text size={14} color={selectedAccount?.color ?? "rgba(255,255,255,0.7)"} numberOfLines={1}>
                        {selectedAccount ? selectedAccount.name : "Account"}
                    </Text>
                </Ripple>
            )}
        </Animated.ScrollView>
    )
}

const styles = StyleSheet.create({
    chip: {
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 15,
        minWidth: (Layout.screen.width - 30 - 30) / 3,
        flex: 1,
        backgroundColor: Colors.primary_lighter,
        borderColor: Color(Colors.primary_lighter).lighten(0.25).hex(),
        borderWidth: 2,
    },
})
