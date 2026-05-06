import IconButton from "@/components/ui/IconButton/IconButton"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import useKeyboard from "@/utils/hooks/useKeyboard"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import moment from "moment"
import { useRef, useState } from "react"
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"
import DateTimePicker from "react-native-modal-datetime-picker"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline"
import EditScopeSheet from "../components/EditScopeSheet"
import TimelineCreateHeader from "../components/CreateTimeline/TimelineCreateHeader"
import useCreateTimeline from "../hooks/general/useCreateTimeline"
import type { TimelineScreenProps } from "../types"
import { Todo } from "./CreateTimelineTodos"
import GlassView from "@/components/ui/GlassView"
import DatePicker from "@/components/DatePicker"
import dayjs from "dayjs"

const styles = StyleSheet.create({
    timeContainer: {
        flexDirection: "row",
        width: "100%",
        backgroundColor: Colors.primary_light,
        borderWidth: 2,
        borderColor: Colors.primary_lighter,
        borderRadius: 15,
        padding: 7.5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    timeText: {
        color: Colors.secondary,
        textAlign: "center",
    },
    button: {
        borderRadius: 100,
        gap: 10,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
})

export default function CreateTimeLineEventModal({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
    const isKeyboardOpen = useKeyboard()

    const { f, isLoading, isEditing, sheetRef, scopeSheetRef, onScopeSelected, handleChangeDate } = useCreateTimeline({
        route,
        navigation,
    })

    const [timePicker, setTimePicker] = useState<"begin" | "end" | "">("")
    const endManuallyChanged = useRef(isEditing)

    const numberOfLines = f.values.desc.split("\n").length

    const insets = useSafeAreaInsets()

    return (
        <>
            <View style={{ flex: 1, paddingBottom: insets.bottom }}>
                <TimelineCreateHeader
                    handleChangeDate={(date) => {
                        handleChangeDate(date)
                        navigation.setParams({
                            selectedDate: moment(date).format("YYYY-MM-DD"),
                        })
                    }}
                    selectedDate={route.params.selectedDate}
                    onSubmit={f.handleSubmit}
                    submitDisabled={!(f.isValid && !f.isSubmitting && f.dirty)}
                />

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 15, paddingTop: 80 }}
                    keyboardDismissMode={"on-drag"}
                >
                    <ValidatedInput
                        placeholder="Like  'take out the trash' etc.."
                        name="title"
                        label="Title*"
                        showLabel
                        formik={f}
                        helperStyle={{ marginLeft: 2.5 }}
                    />
                    <ValidatedInput
                        showLabel
                        label="Content"
                        numberOfLines={
                            isEditing ? f.values.desc.split("\n").length + 10 : f.values.desc.split("\n").length + 3
                        }
                        style={{
                            ...(Platform.OS === "ios" && {
                                minHeight: (numberOfLines <= 5 ? 5 : numberOfLines) * 30,
                            }),
                        }}
                        multiline
                        placeholder="What you wanted to do"
                        name="desc"
                        formik={f}
                        scrollEnabled
                        textAlignVertical="top"
                    />

                    <ValidatedInput.Label error={false} text="Time range*" />
                    <View style={styles.timeContainer}>
                        <Ripple style={{ flex: 1, padding: 5 }} onPress={() => setTimePicker("begin")}>
                            <Text variant="title" style={styles.timeText}>
                                {f.values.begin.split(":").slice(0, 2).join(":")}
                            </Text>
                            <Text style={{ fontSize: 13, color: "gray", textAlign: "center" }}>From</Text>
                        </Ripple>

                        <Text variant="body" style={{ color: "gray", padding: 5 }}>
                            -
                        </Text>

                        <Ripple style={{ flex: 1, padding: 5 }} onPress={() => setTimePicker("end")}>
                            <Text variant="title" style={styles.timeText}>
                                {f.values.end.split(":").slice(0, 2).join(":")}
                            </Text>
                            <Text style={{ fontSize: 13, color: "gray", textAlign: "center" }}>To</Text>
                        </Ripple>
                    </View>

                    <View style={{ marginTop: 15 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                            <Ionicons name="notifications-outline" size={16} color={Colors.secondary} />
                            <ValidatedInput.Label error={false} text="Reminder" />
                        </View>
                        <SegmentedButtons
                            value={String(f.values.reminderBeforeMinutes || "")}
                            onChange={(value) => f.setFieldValue("reminderBeforeMinutes", value)}
                            buttons={[
                                { text: "Off", value: "" },
                                { text: "5m", value: "5" },
                                { text: "15m", value: "15" },
                                { text: "30m", value: "30" },
                                { text: "1h", value: "60" },
                            ]}
                            buttonStyle={{ height: 36 }}
                            buttonTextStyle={{ fontSize: 13 }}
                            containerStyle={{ borderRadius: 8 }}
                        />
                    </View>

                    {!isEditing && (
                        <View style={{ marginTop: 15 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <ValidatedInput.Label error={false} text={"Todos "} />

                                <Pressable
                                    onPress={() => {
                                        ;(navigation as any).navigate("CreateTimelineTodos", {
                                            mode: "push-back",
                                            selectedDate: route.params.selectedDate,
                                            todos: route.params.todos || [],
                                        })
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            color: Colors.secondary,
                                            padding: 5,
                                        }}
                                    >
                                        Create new todos
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={{ marginTop: 2.5 }}>
                                {(route.params.todos?.length || 0) > 0 ? (
                                    route.params.todos?.map((todo, index) => (
                                        <Todo
                                            index={index}
                                            value={todo}
                                            key={index}
                                            showRemove
                                            onRemove={() => {
                                                navigation.setParams({
                                                    ...route.params,
                                                    todos: route.params?.todos?.filter((_, i) => i !== index),
                                                })
                                            }}
                                        />
                                    ))
                                ) : (
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ color: "gray", fontStyle: "italic", fontSize: 15 }}>
                                            No todos added yet.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <TimePickerModal
                        isVisible={!!timePicker}
                        currentTime={timePicker === "begin" ? f.values.begin : f.values.end}
                        onConfirm={(currentlySelectedTime) => {
                            let finalDate = moment(currentlySelectedTime)

                            if (timePicker === "begin") {
                                f.setFieldValue("begin", finalDate.format("HH:mm"))

                                if (!endManuallyChanged.current) {
                                    f.setFieldValue("end", finalDate.clone().add(1, "hours").format("HH:mm"))
                                }
                            }

                            if (timePicker === "end") {
                                endManuallyChanged.current = true
                                f.setFieldValue("end", finalDate.format("HH:mm"))

                                if (finalDate.isBefore(moment(f.values.begin, "HH:mm"))) {
                                    f.setFieldValue("begin", finalDate.subtract(1, "hours").format("HH:mm"))
                                }
                            }

                            setTimePicker("")
                        }}
                        onCancel={() => setTimePicker("")}
                    />
                </ScrollView>

                <SubmitButton
                    f={f}
                    openSheet={() => sheetRef.current?.expand()}
                    isEditing={isEditing}
                    isKeyboardOpen={isKeyboardOpen || false}
                    isLoading={isLoading}
                />
            </View>

            <CreateRepeatableTimeline formik={f} ref={sheetRef as any} />
            <EditScopeSheet ref={scopeSheetRef as any} onScopeSelected={onScopeSelected} />
        </>
    )
}

interface SubmitButtonProps {
    isKeyboardOpen: boolean
    isLoading: boolean
    f: any
    isEditing: boolean
    openSheet: () => void
}

const SubmitButton = (props: SubmitButtonProps) => (
    <View
        style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
        }}
    >
        <GlassView style={styles.button}>
            <IconButton
                onPress={props.openSheet}
                icon={<AntDesign name="calendar" color={Colors.foreground} size={20} />}
            />
        </GlassView>

        <GlassView style={styles.button}>
            <DatePicker
                mode="single"
                setDates={({ start }) => props.f.setFieldValue("date", dayjs(start).format("YYYY-MM-DD"))}
                dates={{
                    start: dayjs(props.f.values.date).toDate(),
                    end: dayjs(props.f.values.date).toDate(),
                }}
                buttonComponent={({ start }) => (
                    <Text style={{ color: "#fff", paddingHorizontal: 5 }}>{dayjs(start).format("MMMM D, YYYY")}</Text>
                )}
            />
        </GlassView>
    </View>
)

const TimePickerModal = (props: {
    isVisible: boolean
    onConfirm: (date: Date) => void
    onCancel: () => void
    currentTime: string
}) => {
    const currentDate = moment(props.currentTime, "HH:mm").toDate()

    return (
        <DateTimePicker
            date={currentDate}
            mode="time"
            isDarkModeEnabled
            is24Hour
            isVisible={props.isVisible}
            onConfirm={props.onConfirm}
            onCancel={props.onCancel}
        />
    )
}
