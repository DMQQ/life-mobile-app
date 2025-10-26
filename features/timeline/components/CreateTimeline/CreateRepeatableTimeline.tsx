import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import Input from "@/components/ui/TextInput/TextInput"
import ThemedCalendar from "@/components/ui/ThemedCalendar/ThemedCalendar"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import { forwardRef, memo, useMemo, useState } from "react"
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"

const styles = StyleSheet.create({
    arrow_button: {
        backgroundColor: Colors.primary_lighter,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        borderRadius: 5,
    },
    modal_container: {
        padding: 15,
        flex: 1,
        paddingBottom: 50,
    },
    title_container: {
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        color: Colors.secondary,
        fontWeight: "bold",
        fontSize: 20,
    },

    clear_button: {
        backgroundColor: Colors.primary_lighter,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },

    clear_button_text: {
        color: Colors.secondary,
        fontWeight: "bold",
        fontSize: 13,
    },
    suggestion_text: {
        color: "gray",
        fontWeight: "bold",
        fontSize: 14,
        marginTop: 15,
    },
    save_button: {
        backgroundColor: Colors.secondary,
        paddingVertical: 15,
        marginTop: 10,
    },
})

interface CreateRepeatableTimelineProps {
    formik: any
}

const ArrowButton = (props: { onPress: () => void; arrow: "arrow-up" | "arrow-down"; disabled?: boolean }) => (
    <Ripple
        disabled={props.disabled || false}
        onPress={() => props.onPress()}
        style={[styles.arrow_button, { opacity: props.disabled ? 0.5 : 1 }]}
    >
        <AntDesign name={props.arrow} size={24} color={props.arrow === "arrow-up" ? Colors.secondary : Colors.error} />
    </Ripple>
)

const REPEAT_VARIANTS = [
    {
        text: "Daily",
        value: "daily",
    },
    {
        text: "Weekly",
        value: "weekly",
    },
]

const Txt = (props: { text: string }) => (
    <Text
        style={{
            color: Colors.secondary,
            fontWeight: "bold",
            marginBottom: 5,
        }}
    >
        {props.text}
    </Text>
)

const CreateRepeatableTimeline = forwardRef<BottomSheetType, CreateRepeatableTimelineProps>(({ formik: f }, ref) => {
    const onClearFields = () => {
        f.setFieldValue("repeatCount", "")
        f.setFieldValue("repeatOn", "")
        f.setFieldValue("repeatEveryNth", "")
    }

    const segmentedButtons = new Array(7).fill(0).map((_, i) => ({
        text: `${i + 1}`,
        value: `${i + 1}`,
    }))

    const onArrowUpPress = () => {
        f.setFieldValue("repeatCount", (+f.values.repeatCount + 1).toString())
    }

    const onArrowDownPress = () => {
        if (+f.values.repeatCount - 1 < 0) return
        f.setFieldValue("repeatCount", (+f.values.repeatCount - 1).toString())
    }

    const [view, setView] = useState<"form" | "calendar">("form")

    const markedDates = useMemo(() => {
        const dates = {} as Record<string, { selected: boolean; selectedColor: string }>
        const repeatCount = Number(f.values.repeatCount)
        const repeatEveryNth = Number(f.values.repeatEveryNth)
        const repeatOn = f.values.repeatOn
        if (repeatCount && repeatEveryNth && repeatOn) {
            for (let i = 0; i < repeatCount; i++) {
                const date = new Date()
                date.setDate(date.getDate() + i * repeatEveryNth)
                dates[date.toISOString().split("T")[0]] = {
                    selected: true,
                    selectedColor: Colors.secondary,
                }
            }
        }
        return dates
    }, [f.values.repeatCount, f.values.repeatOn, f.values.repeatEveryNth])

    return (
        <BottomSheet snapPoints={["70%"]} ref={ref}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <View style={styles.modal_container}>
                    {view === "form" && (
                        <View style={{ flex: 1, gap: 10 }}>
                            <View style={styles.title_container}>
                                <Text style={styles.title}>Options</Text>

                                <Ripple onPress={onClearFields} style={styles.clear_button}>
                                    <Text style={styles.clear_button_text}>CLEAR</Text>
                                </Ripple>
                            </View>

                            <View>
                                <Txt text="Number of events" />

                                <Input
                                    keyboardType="numeric"
                                    style={{ flex: 1, width: Layout.screen.width - 30 }}
                                    value={f.values.repeatCount}
                                    onChangeText={(t) => f.setFieldValue("repeatCount", t)}
                                    placeholder="Repeat count"
                                    placeholderTextColor={"gray"}
                                    left={
                                        <ArrowButton
                                            disabled={Number(f.values.repeatCount) === 0 || f.values.repeatCount === ""}
                                            arrow="arrow-down"
                                            onPress={onArrowDownPress}
                                        />
                                    }
                                    right={<ArrowButton arrow="arrow-up" onPress={onArrowUpPress} />}
                                />
                            </View>

                            <View>
                                <Txt text="Repeat variants" />
                                <SegmentedButtons
                                    value={f.values.repeatOn}
                                    onChange={(value) => f.setFieldValue("repeatOn", value)}
                                    buttons={REPEAT_VARIANTS}
                                    containerStyle={{ borderRadius: 10 }}
                                />
                            </View>

                            <View>
                                <Txt text="Repeat every nth day" />
                                <SegmentedButtons
                                    containerStyle={{ borderRadius: 10 }}
                                    value={f.values.repeatEveryNth}
                                    onChange={(value) => f.setFieldValue("repeatEveryNth", value)}
                                    buttons={segmentedButtons}
                                />
                            </View>
                        </View>
                    )}

                    {view === "calendar" && (
                        <View style={{ flex: 1 }}>
                            <ThemedCalendar markedDates={markedDates} />
                        </View>
                    )}

                    <Button
                        fontStyle={{ fontSize: 16 }}
                        onPress={() => {
                            setView((prev) => (prev === "form" ? "calendar" : "form"))
                        }}
                    >
                        {view === "form" ? "View dates in calendar" : "Go back to form"}
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </BottomSheet>
    )
})

export default memo(CreateRepeatableTimeline)
