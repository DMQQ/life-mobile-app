import { Button, IconButton } from "@/components"
import DatePicker from "@/components/DatePicker"
import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Subscription } from "@/types"
import { AntDesign } from "@expo/vector-icons"
import Color from "color"
import moment from "moment"
import { useState } from "react"
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import Ripple from "react-native-material-ripple"
import NumbersPad from "../components/CreateExpense/NumberPad"
import useSubscription from "../hooks/useSubscription"

type BillingCycle = "daily" | "weekly" | "monthly" | "yearly"

interface Props {
    route: { params: { subscription: Subscription } }
    navigation: any
}

const BILLING_CYCLES: BillingCycle[] = ["daily", "weekly", "monthly", "yearly"]

export default function EditSubscription({ route, navigation }: Props) {
    const { subscription } = route.params
    const { modifySubscription, modifySubscriptionState } = useSubscription()

    const [description, setDescription] = useState(subscription.description || "")
    const [amount, setAmount] = useState(subscription.amount?.toString() || "0")
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription.billingCycle as BillingCycle)
    const [dateStart, setDateStart] = useState<Date>(
        subscription.dateStart ? new Date(+subscription.dateStart) : new Date(),
    )
    const [dateEnd, setDateEnd] = useState<Date>(subscription.dateEnd ? new Date(+subscription.dateEnd) : new Date())
    const [nextBillingDate, setNextBillingDate] = useState<Date>(
        subscription.nextBillingDate ? new Date(+subscription.nextBillingDate) : new Date(),
    )

    const transformX = useSharedValue(0)
    const loading = modifySubscriptionState.loading

    const animatedAmount = useAnimatedStyle(
        () => ({
            transform: [{ translateX: transformX.value }],
            fontSize: interpolate(amount.length, [0, 10, 15], [90, 60, 35], "clamp"),
        }),
        [amount],
    )

    const handleAmountChange = (value: string) => {
        setAmount((prev) => {
            if (value === "C") {
                const val = prev.slice(0, -1)
                return val.length === 0 ? "0" : val
            }
            if (typeof +value === "number" && prev.includes(".") && prev.split(".")[1].length === 2) return prev
            if (prev.length === 1 && prev === "0" && value !== ".") return value
            if (prev.includes(".") && value === ".") return prev
            if (prev.length === 0 && value === ".") return "0."
            return prev + value
        })
    }

    const handleSave = async () => {
        Feedback.trigger("impactLight")
        await modifySubscription({
            variables: {
                input: {
                    id: subscription.id,
                    description: description.trim() || undefined,
                    amount: parseFloat(amount),
                    billingCycle,
                    dateStart: dateStart.toISOString(),
                    dateEnd: dateEnd.toISOString(),
                    nextBillingDate: nextBillingDate.toISOString(),
                },
            },
        })
        navigation.goBack()
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <GlassView style={styles.closeButton}>
                            <IconButton
                                onPress={() => navigation.goBack()}
                                icon={<AntDesign name="close" size={20} color="#fff" />}
                            />
                        </GlassView>

                        <View style={styles.amountContainer}>
                            <Animated.Text style={[styles.amountText, animatedAmount]}>
                                {amount}
                                <Text variant="body" style={{ fontSize: 20 }}>
                                    zł
                                </Text>
                            </Animated.Text>
                        </View>

                        <View style={styles.contentContainer}>
                            <View style={{ borderRadius: 35, flex: 1 }}>
                                <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            width: "100%",
                                            alignItems: "center",
                                            zIndex: 1000,
                                        }}
                                    >
                                        <Input
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Description"
                                            style={{ flex: 1, width: "100%" }}
                                            containerStyle={{ flex: 1, borderRadius: 20 }}
                                            right={
                                                <IconButton
                                                    onPress={handleSave}
                                                    disabled={loading}
                                                    icon={
                                                        <GlassView
                                                            tintColor={Colors.secondary}
                                                            style={{ padding: 10, borderRadius: 100 }}
                                                        >
                                                            {loading ? (
                                                                <ActivityIndicator size={20} color="#fff" />
                                                            ) : (
                                                                <AntDesign
                                                                    name="edit"
                                                                    size={20}
                                                                    color="rgba(255,255,255,0.7)"
                                                                />
                                                            )}
                                                        </GlassView>
                                                    }
                                                />
                                            }
                                        />
                                    </View>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyboardDismissMode="on-drag"
                                        contentContainerStyle={{ gap: 10 }}
                                    >
                                        <DatePicker
                                            mode="single"
                                            dates={{ start: dateStart, end: dateStart }}
                                            setDates={({ start }) => setDateStart(start)}
                                            buttonComponent={({ start }) => (
                                                <Ripple style={styles.chip}>
                                                    <AntDesign
                                                        name="calendar"
                                                        size={15}
                                                        color="rgba(255,255,255,0.7)"
                                                    />
                                                    <Text style={styles.chipText}>
                                                        Start {moment(start).format("DD.MM.YY")}
                                                    </Text>
                                                </Ripple>
                                            )}
                                        />

                                        <DatePicker
                                            mode="single"
                                            dates={{ start: nextBillingDate, end: nextBillingDate }}
                                            setDates={({ start }) => setNextBillingDate(start)}
                                            buttonComponent={({ start }) => (
                                                <Ripple style={styles.chip}>
                                                    <AntDesign
                                                        name="calendar"
                                                        size={15}
                                                        color="rgba(255,255,255,0.7)"
                                                    />
                                                    <Text style={styles.chipText}>
                                                        Next {moment(start).format("DD.MM.YY")}
                                                    </Text>
                                                </Ripple>
                                            )}
                                        />

                                        <DatePicker
                                            mode="single"
                                            dates={{ start: dateEnd, end: dateEnd }}
                                            setDates={({ start }) => setDateEnd(start)}
                                            buttonComponent={({ start }) => (
                                                <Ripple style={styles.chip}>
                                                    <AntDesign
                                                        name="calendar"
                                                        size={15}
                                                        color="rgba(255,255,255,0.7)"
                                                    />
                                                    <Text style={styles.chipText}>
                                                        End {moment(start).format("DD.MM.YY")}
                                                    </Text>
                                                </Ripple>
                                            )}
                                        />
                                        {BILLING_CYCLES.map((cycle) => (
                                            <Ripple
                                                key={cycle}
                                                onPress={() => {
                                                    Feedback.trigger("impactLight")
                                                    setBillingCycle(cycle)
                                                }}
                                                style={[
                                                    styles.chip,
                                                    billingCycle === cycle && {
                                                        backgroundColor: Color(Colors.secondary).alpha(0.2).string(),
                                                        borderColor: Color(Colors.secondary).alpha(0.4).string(),
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        billingCycle === cycle && { color: Colors.secondary },
                                                    ]}
                                                >
                                                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                                                </Text>
                                            </Ripple>
                                        ))}
                                    </ScrollView>
                                </Animated.View>

                                <NumbersPad handleAmountChange={handleAmountChange} rotateBackButton={amount === "0"} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 15,
        justifyContent: "space-between",
    },
    closeButton: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 100,
        padding: 10,
        borderRadius: 100,
    },
    amountContainer: {
        height: 250,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 45,
        paddingHorizontal: 15,
    },
    amountText: {
        color: Colors.foreground,
        fontWeight: "bold",
        textAlign: "center",
    },
    contentContainer: {
        padding: 15,
        flex: 1,
        gap: 15,
        maxHeight: Layout.screen.height / 1.65,
        backgroundColor: Colors.primary_light,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingBottom: 30,
    },
    chip: {
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        backgroundColor: Colors.primary_lighter,
        borderColor: Color(Colors.primary_lighter).lighten(0.25).hex(),
        borderWidth: 2,
        height: 45,
    },
    chipText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
    },
    saveButton: {
        padding: 15,
        backgroundColor: Colors.primary_light,
        paddingBottom: 30,
    },
})
