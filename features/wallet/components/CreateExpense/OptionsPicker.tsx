import DatePicker from "@/components/DatePicker"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { SpontaneousRateChip } from "@/features/wallet/components/CreateExpense/SpontaneousRate"
import { CategoryUtils, Icons } from "@/features/wallet/components/Expense/ExpenseIcon"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign, Entypo } from "@expo/vector-icons"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment/moment"
import { StyleSheet, Text, View } from "react-native"
import Haptic from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { LinearTransition } from "react-native-reanimated"

type Type = "expense" | "income" | null

interface OptionsPickerProps {
    type: Type

    setType: React.Dispatch<React.SetStateAction<Type>>

    category: keyof typeof Icons

    setCategory: React.Dispatch<React.SetStateAction<keyof typeof Icons>>

    setChangeView: React.Dispatch<React.SetStateAction<boolean>>

    setSpontaneousView: React.Dispatch<React.SetStateAction<boolean>>

    spontaneousRate: number

    setDate: React.Dispatch<React.SetStateAction<string | null>>

    date: string | null
}

export default function OptionsPicker({
    type,
    setType,
    setChangeView,
    setSpontaneousView,
    setDate,
    category,
    spontaneousRate,
    date,
}: OptionsPickerProps) {
    const typeBackgroundColor =
        type == null
            ? Colors.primary_lighter
            : lowOpacity(
                  type === "expense"
                      ? Colors.error
                      : type === "income"
                        ? Colors.secondary_light_1
                        : Colors.secondary_light_2,
                  0.2,
              )

    const typeTextColor = Color(
        type == null
            ? "rgba(255,255,255,0.7)"
            : type === "expense"
              ? Colors.error
              : type === "income"
                ? Colors.secondary_light_1
                : Colors.secondary_light_2,
    )
        .lighten(0.2)
        .string()

    const typeButtonText =
        type == null ? "Select type" : type === "expense" ? "Expense" : type === "income" ? "Income" : "Refunded"

    const onPressWithFeedback = (callback: () => void) => {
        return () => {
            Haptic.trigger("impactLight")
            callback()
        }
    }

    return (
        <Animated.ScrollView
            keyboardDismissMode={"on-drag"}
            layout={LinearTransition}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row" }}
            contentContainerStyle={{ gap: 10 }}
        >
            <Ripple
                onPress={onPressWithFeedback(() => setType((p) => (p === "expense" ? "income" : "expense")))}
                style={[
                    styles.chip,
                    {
                        backgroundColor: typeBackgroundColor,
                        gap: 10,
                        borderColor: type == null ? styles.chip.borderColor : typeBackgroundColor,
                    },
                ]}
            >
                <View>
                    <TypeIcon type={type} />
                </View>

                <Text
                    numberOfLines={1}
                    style={{
                        color: typeTextColor,
                        fontSize: 14,
                    }}
                >
                    {typeButtonText}
                </Text>
            </Ripple>

            <DatePicker
                mode="single"
                dates={{ start: date ? moment(date).toDate() : new Date(), end: new Date() }}
                setDates={(dates) => {
                    setDate(dayjs(dates.start).format("YYYY-MM-DD"))
                }}
                buttonComponent={({ start }) => (
                    <Ripple
                        style={[styles.chip, { backgroundColor: Colors.primary_lighter, flex: undefined, height: 45 }]}
                    >
                        <AntDesign name="calendar" size={15} color="rgba(255,255,255,0.7)" />
                        <Text
                            style={{
                                color: "rgba(255,255,255,0.7)",
                                fontSize: 14,
                            }}
                        >
                            {moment(start).format("YYYY-MM-DD")}
                        </Text>
                    </Ripple>
                )}
            />

            {type !== "income" && (
                <Ripple
                    onPress={onPressWithFeedback(() => setChangeView((p) => !p))}
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
                        style={{
                            color:
                                category === "none"
                                    ? "rgba(255,255,255,0.7)"
                                    : Color(Icons[category]?.backgroundColor).lighten(0.25).hex(),
                            fontSize: 15,
                        }}
                    >
                        {category === "none" ? "Select category" : CategoryUtils.getCategoryName(category)}
                    </Text>
                </Ripple>
            )}
            <SpontaneousRateChip
                value={spontaneousRate}
                onPress={onPressWithFeedback(() => {
                    setChangeView(false)
                    setSpontaneousView(true)
                })}
            />
        </Animated.ScrollView>
    )
}

const TypeIcon = ({ type }: { type: "expense" | "income" | null }) =>
    type == null ? (
        <View style={{ height: 15, transform: [{ translateY: -6.5 }] }}>
            <Entypo
                name="chevron-up"
                color="rgba(255,255,255,0.7)"
                size={15}
                style={{ transform: [{ translateY: 3 }] }}
            />
            <Entypo
                name="chevron-down"
                color="rgba(255,255,255,0.7)"
                size={15}
                style={{ transform: [{ translateY: -5 }] }}
            />
        </View>
    ) : type === "expense" ? (
        <AntDesign name="arrow-down" size={15} color={Color(Colors.error).lighten(0.2).string()} />
    ) : type === "income" ? (
        <AntDesign name="arrow-up" size={15} color={Color(Colors.secondary_light_1).lighten(0.2).string()} />
    ) : (
        <Entypo name="back-in-time" size={15} color="rgba(255,255,255,0.7)" />
    )

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
