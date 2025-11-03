import Button2 from "@/components/ui/Button/Button2"
import IconButton from "@/components/ui/IconButton/IconButton"
import SegmentedButtons from "@/components/ui/SegmentedButtons"
import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import useKeyboard from "@/utils/hooks/useKeyboard"
import { AntDesign } from "@expo/vector-icons"
import Color from "color"
import moment from "moment"
import { useState } from "react"
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"
import DateTimePicker from "react-native-modal-datetime-picker"
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline"
import SuggestedEvents from "../components/CreateTimeline/SuggestedEvents/SuggestedEvents"
import TimelineCreateHeader from "../components/CreateTimeline/TimelineCreateHeader"
import timelineStyles from "../components/timeline.styles"
import useCreateTimeline from "../hooks/general/useCreateTimeline"
import type { TimelineScreenProps } from "../types"
import { Button } from "@/components"
import { useIsFocused } from "@react-navigation/native"
import TodoItem from "../components/TodoItem"
import { Todo } from "./CreateTimelineTodos"

const styles = StyleSheet.create({
    timeContainer: {
        flexDirection: "row",
        width: "100%",
        backgroundColor: Colors.primary_light,
        borderWidth: 2,
        borderColor: Colors.primary_light,
        borderRadius: 10,
        padding: 7.5,
        alignItems: "center",
        justifyContent: "space-between",
    },
    timeText: {
        color: Colors.secondary,
        textAlign: "center",
    },
})

const radioOptions = [
    { label: "None", value: "none" },
    { label: "All day", value: "all-day" },
    { label: "Repeatable", value: "repeatable" },
]

export default function CreateTimeLineEventModal({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
    const isKeyboardOpen = useKeyboard()

    const { f, isLoading, isEditing, sheetRef, handleChangeDate } = useCreateTimeline({
        route,
        navigation,
    })

    const [timePicker, setTimePicker] = useState<"begin" | "end" | "">("")

    const numberOfLines = f.values.desc.split("\n").length

    const insets = useSafeAreaInsets()

    const keyboard = useAnimatedKeyboard()

    const animatedKeyboardStyle = useAnimatedStyle(() => {
        if (route.params.mode === "edit") return {}
        return {
            transform: [
                {
                    translateY: -keyboard.height.value / 2,
                },
            ],
        }
    }, [route.params.mode])

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
            <TimelineCreateHeader
                handleChangeDate={(date) => {
                    handleChangeDate(date)
                    navigation.setParams({
                        selectedDate: moment(date).format("YYYY-MM-DD"),
                    })
                }}
                selectedDate={route.params.selectedDate}
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }} keyboardDismissMode={"on-drag"}>
                <Animated.View style={animatedKeyboardStyle}>
                    {/* {!isEditing && <SuggestedEvents date={route.params.selectedDate} />} */}

                    <ValidatedInput
                        placeholder="Like  'take out the trash' etc.."
                        name="title"
                        label="Event's title*"
                        showLabel
                        formik={f}
                        helperStyle={{ marginLeft: 2.5 }}
                    />
                    <ValidatedInput
                        showLabel
                        label="Event's content"
                        numberOfLines={
                            isEditing ? f.values.desc.split("\n").length + 10 : f.values.desc.split("\n").length + 3
                        }
                        style={{
                            ...(Platform.OS === "ios" && {
                                minHeight: (numberOfLines <= 5 ? 5 : numberOfLines) * 20,
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
                        </Ripple>

                        <Text variant="body" style={{ color: "gray", padding: 5 }}>
                            to
                        </Text>

                        <Ripple style={{ flex: 1, padding: 5 }} onPress={() => setTimePicker("end")}>
                            <Text variant="title" style={styles.timeText}>
                                {f.values.end.split(":").slice(0, 2).join(":")}
                            </Text>
                        </Ripple>
                    </View>

                    {!isEditing && (
                        <View style={{ marginTop: 15 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <ValidatedInput.Label error={false} text={"Todos "} />

                                <Pressable
                                    onPress={() => {
                                        ;(navigation as any).navigate("CreateTimelineTodos", {
                                            mode: "push-back",

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

                    {/* <View style={{ marginTop: 10 }}>
                        <ValidatedInput.Label error={false} text="How to send you notifications?" />
                        <SegmentedButtons
                            containerStyle={{
                                borderRadius: 15,
                                backgroundColor: Colors.primary_light,
                            }}
                            buttonTextStyle={{ fontWeight: "400" }}
                            buttonStyle={{
                                margin: 10,
                                height: 40,
                            }}
                            buttons={radioOptions.map((prev) => ({
                                text: prev.label,
                                value: prev.value,
                            }))}
                            value={f.values.notification}
                            onChange={(val) => f.setFieldValue("notification", val)}
                        />
                    </View> */}

                    <TimePickerModal
                        isVisible={!!timePicker}
                        currentTime={timePicker === "begin" ? f.values.begin : f.values.end}
                        onConfirm={(currentlySelectedTime) => {
                            let finalDate = moment(currentlySelectedTime)

                            if (timePicker === "begin") {
                                f.setFieldValue("begin", finalDate.format("HH:mm"))

                                if (finalDate.isAfter(moment(f.values.end, "HH:mm"))) {
                                    f.setFieldValue("end", finalDate.add(1, "hours").format("HH:mm"))
                                }
                            }

                            if (timePicker === "end") {
                                f.setFieldValue("end", finalDate.format("HH:mm"))

                                if (finalDate.isBefore(moment(f.values.begin, "HH:mm"))) {
                                    f.setFieldValue("begin", finalDate.subtract(1, "hours").format("HH:mm"))
                                }
                            }

                            setTimePicker("")
                        }}
                        onCancel={() => setTimePicker("")}
                    />

                    <CreateRepeatableTimeline formik={f} ref={sheetRef as any} />
                </Animated.View>
            </ScrollView>
            <SubmitButton
                f={f}
                openSheet={() => sheetRef.current?.expand()}
                isEditing={isEditing}
                isKeyboardOpen={isKeyboardOpen || false}
                isLoading={isLoading}
            />
        </View>
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
    <View style={{ flexDirection: "row", paddingHorizontal: 15 }}>
        <IconButton
            onPress={props.openSheet}
            style={{
                padding: 7.5,
                width: 35,
                marginRight: 15,
            }}
            icon={<AntDesign name="calendar" color={Colors.foreground} size={20} />}
        />
        <Button
            icon={
                props.isLoading ? (
                    <ActivityIndicator style={{ marginRight: 5 }} size={18} color={Colors.foreground} />
                ) : null
            }
            disabled={!(props.f.isValid && !props.f.isSubmitting && props.f.dirty)}
            type="contained"
            callback={() => props.f.handleSubmit()}
            style={[
                timelineStyles.submitButton,
                {
                    backgroundColor: !(props.f.isValid && !props.f.isSubmitting && props.f.dirty)
                        ? Color(Colors.secondary).alpha(0.1).string()
                        : Colors.secondary,
                },
            ]}
            fontStyle={{ fontSize: 16 }}
        >
            {props.isEditing ? "Save changes" : "Create new event"}
        </Button>
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
