import Text from "@/components/ui/Text/Text"
import ValidatedInput from "@/components/ui/ValidatedInput"
import Colors from "@/constants/Colors"
import dayjs from "dayjs"
import moment from "moment"
import { useRef, useState } from "react"
import { Platform, Pressable, ScrollView, View } from "react-native"

import CreateRepeatableTimeline from "../components/CreateTimeline/CreateRepeatableTimeline"
import EditScopeSheet from "../components/EditScopeSheet"
import TimelineCreateHeader from "../components/CreateTimeline/TimelineCreateHeader"
import useCreateTimeline from "../hooks/general/useCreateTimeline"
import type { TimelineScreenProps } from "../types"
import { Todo } from "./CreateTimelineTodos"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"
import ChipButton from "@/components/ui/Button/ChipButton"
import { Host, DatePicker as SwiftDatePicker } from "@expo/ui/swift-ui"
import { datePickerStyle, frame } from "@expo/ui/swift-ui/modifiers"

export default function CreateTimeLineEventModal({ route, navigation }: TimelineScreenProps<"TimelineCreate">) {
    const { f, isEditing, scopeSheetRef, onScopeSelected, handleChangeDate } = useCreateTimeline({
        route,
        navigation,
    })

    const endManuallyChanged = useRef(isEditing)

    const numberOfLines = f.values.desc.split("\n").length

    const [expanded, setExpanded] = useState<{ date: boolean; start: boolean; end: boolean }>({
        date: false,
        start: false,
        end: false,
    })

    const toggleExpanded = (key: "date" | "start" | "end") => setExpanded((p) => ({ ...p, [key]: !p[key] }))

    return (
        <>
            <View style={{ flex: 1 }}>
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
                    dirty={f.dirty}
                />

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }} keyboardDismissMode={"on-drag"}>
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
                        <Pressable
                            onPress={() => toggleExpanded("date")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 15,
                                paddingVertical: 12,
                            }}
                        >
                            <Text variant="subtitle">Date</Text>
                            <Text variant="body" style={{ color: Colors.foreground }}>
                                {moment(route.params.selectedDate).format("DD MMMM YYYY")}
                            </Text>
                        </Pressable>
                        {expanded.date && (
                            <View style={{ alignItems: "center", paddingBottom: 10 }}>
                                <Host matchContents>
                                    <SwiftDatePicker
                                        selection={dayjs(route.params.selectedDate).toDate()}
                                        onDateChange={(d) => {
                                            handleChangeDate(d)
                                            navigation.setParams({
                                                selectedDate: moment(d).format("YYYY-MM-DD"),
                                            })
                                        }}
                                        modifiers={[datePickerStyle("graphical"), frame({ width: 340 })]}
                                    />
                                </Host>
                            </View>
                        )}

                        <View style={{ borderWidth: 0.5, borderColor: Colors.borderColor }} />

                        <Pressable
                            onPress={() => toggleExpanded("start")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 15,
                                paddingVertical: 12,
                            }}
                        >
                            <Text variant="subtitle">Starts</Text>
                            <Text variant="body" style={{ color: Colors.foreground }}>
                                {f.values.begin}
                            </Text>
                        </Pressable>
                        {expanded.start && (
                            <View style={{ alignItems: "center", paddingBottom: 10 }}>
                                <Host matchContents>
                                    <SwiftDatePicker
                                        selection={moment(f.values.begin, "HH:mm").toDate()}
                                        displayedComponents={["hourAndMinute"]}
                                        onDateChange={(d) => {
                                            const t = moment(d).format("HH:mm")
                                            f.setFieldValue("begin", t)
                                            if (!endManuallyChanged.current) {
                                                f.setFieldValue(
                                                    "end",
                                                    moment(t, "HH:mm").add(1, "hours").format("HH:mm"),
                                                )
                                            }
                                        }}
                                        modifiers={[datePickerStyle("wheel")]}
                                    />
                                </Host>
                            </View>
                        )}

                        <View style={{ borderWidth: 0.5, borderColor: Colors.borderColor }} />

                        <Pressable
                            onPress={() => toggleExpanded("end")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 15,
                                paddingVertical: 12,
                            }}
                        >
                            <Text variant="subtitle">Ends</Text>
                            <Text variant="body" style={{ color: Colors.foreground }}>
                                {f.values.end}
                            </Text>
                        </Pressable>
                        {expanded.end && (
                            <View style={{ alignItems: "center", paddingBottom: 10 }}>
                                <Host matchContents>
                                    <SwiftDatePicker
                                        selection={moment(f.values.end, "HH:mm").toDate()}
                                        displayedComponents={["hourAndMinute"]}
                                        onDateChange={(d) => {
                                            const t = moment(d).format("HH:mm")
                                            endManuallyChanged.current = true
                                            f.setFieldValue("end", t)
                                            if (moment(t, "HH:mm").isBefore(moment(f.values.begin, "HH:mm"))) {
                                                f.setFieldValue(
                                                    "begin",
                                                    moment(t, "HH:mm").subtract(1, "hours").format("HH:mm"),
                                                )
                                            }
                                        }}
                                        modifiers={[datePickerStyle("wheel")]}
                                    />
                                </Host>
                            </View>
                        )}
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
