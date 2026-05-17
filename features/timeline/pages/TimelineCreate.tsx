import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import dayjs from "dayjs"
import moment from "moment"
import { useRef } from "react"
import { Platform, ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline"
import EditScopeSheet from "../components/EditScopeSheet"
import TimelineCreateHeader from "../components/CreateTimeline/TimelineCreateHeader"
import useCreateTimeline from "../hooks/general/useCreateTimeline"
import type { TimelineScreenProps } from "../types"
import { Todo } from "./CreateTimelineTodos"
import TimePicker from "@/components/TimePicker"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"
import DatePicker from "@/components/DatePicker"
import ChipButton from "@/components/ui/Button/ChipButton"

const styles = StyleSheet.create({
    timeContainer: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "space-between",
    },
})

export default function CreateTimeLineEventModal({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
    const { f, isLoading, isEditing, scopeSheetRef, onScopeSelected, handleChangeDate } = useCreateTimeline({
        route,
        navigation,
    })

    const endManuallyChanged = useRef(isEditing)

    const numberOfLines = f.values.desc.split("\n").length

    const insets = useSafeAreaInsets()

    return (
        <>
            <View style={{ flex: 1, paddingBottom: insets.bottom }}>
                <TimelineCreateHeader
                    handleChangeDate={(date: Date) => {
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
                    contentContainerStyle={{ padding: 15, paddingTop: 60, paddingBottom: 40 }}
                    keyboardDismissMode={"on-drag"}
                >
                    <Section title="Content" cardStyle={{ padding: 5 }}>
                        <ValidatedInput
                            placeholder="Title"
                            name="title"
                            label="Title*"
                            showLabel={false}
                            formik={f}
                            helperStyle={{ marginLeft: 2.5 }}
                            flat
                        />
                        <View style={{ borderWidth: 0.5, borderColor: Colors.borderColor }} />
                        <ValidatedInput
                            flat
                            showLabel={false}
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
                            placeholder="Description"
                            name="desc"
                            formik={f}
                            scrollEnabled
                            textAlignVertical="top"
                        />
                    </Section>

                    <Section title="Time">
                        <View style={styles.timeContainer}>
                            <Text variant="subtitle">Date</Text>
                            <DatePicker
                                mode="single"
                                dates={{
                                    start: dayjs(route.params.selectedDate).toDate(),
                                    end: dayjs(route.params.selectedDate).toDate(),
                                }}
                                setDates={(d) => {
                                    handleChangeDate(d.start)
                                    navigation.setParams({
                                        selectedDate: moment(d.start).format("YYYY-MM-DD"),
                                    })
                                }}
                            />
                        </View>

                        <View style={{ borderWidth: 0.5, borderColor: Colors.borderColor }} />

                        <View style={styles.timeContainer}>
                            <Text variant="subtitle">Starts</Text>
                            <TimePicker
                                label=""
                                value={moment(f.values.begin, "HH:mm").format("HH:mm")}
                                onChange={(t) => {
                                    f.setFieldValue("begin", t)
                                    if (!endManuallyChanged.current) {
                                        f.setFieldValue("end", moment(t, "HH:mm").add(1, "hours").format("HH:mm"))
                                    }
                                }}
                            />
                        </View>

                        <View style={{ borderWidth: 0.5, borderColor: Colors.borderColor }} />

                        <View style={styles.timeContainer}>
                            <Text variant="subtitle">Ends</Text>
                            <TimePicker
                                label=""
                                value={moment(f.values.end, "HH:mm").format("HH:mm")}
                                onChange={(t) => {
                                    endManuallyChanged.current = true
                                    f.setFieldValue("end", t)
                                    if (moment(t, "HH:mm").isBefore(moment(f.values.begin, "HH:mm"))) {
                                        f.setFieldValue(
                                            "begin",
                                            moment(t, "HH:mm").subtract(1, "hours").format("HH:mm"),
                                        )
                                    }
                                }}
                            />
                        </View>
                    </Section>

                    <Section title="Reminder" cardStyle={{ padding: 0 }}>
                        <GroupSelector
                            value={String(f.values.reminderBeforeMinutes || "")}
                            onChange={(value) => f.setFieldValue("reminderBeforeMinutes", value)}
                            options={[
                                { label: "Off", value: "" },
                                { label: "5m", value: "5" },
                                { label: "15m", value: "15" },
                                { label: "30m", value: "30" },
                                { label: "1h", value: "60" },
                            ]}
                        />
                    </Section>

                    {!isEditing && (
                        <Section
                            title="Todos"
                            headerRight={
                                <ChipButton
                                    onPress={() => {
                                        ;(navigation as any).navigate("CreateTimelineTodos", {
                                            mode: "push-back",
                                            selectedDate: route.params.selectedDate,
                                            todos: route.params.todos || [],
                                        })
                                    }}
                                >
                                    Add todos
                                </ChipButton>
                            }
                            cardStyle={{ padding: 10 }}
                        >
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
                                <Text variant="caption" style={{ color: Colors.text_dark, fontStyle: "italic" }}>
                                    No todos added yet.
                                </Text>
                            )}
                        </Section>
                    )}

                    {!isEditing && <CreateRepeatableTimeline formik={f} />}
                </ScrollView>
            </View>

            <EditScopeSheet ref={scopeSheetRef as any} onScopeSelected={onScopeSelected} />
        </>
    )
}
