import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { Host, DatePicker as SwiftDatePicker } from "@expo/ui/swift-ui"
import { datePickerStyle, frame } from "@expo/ui/swift-ui/modifiers"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Section from "@/components/ui/Section"
import GroupSelector from "@/components/ui/GroupSelector"
import { ModalHeader } from "@/components"
import Background from "@/components/ui/Background"
import Layout from "@/constants/Layout"
import dayjs from "dayjs"
import { DEFAULT_TIMELINE_FILTERS, TimelineFilterState, TimelineScreenProps } from "../types"
import { applyFilters } from "../filterBridge"

const STATUS_OPTIONS = [
    { label: "All", value: "all" as const },
    { label: "To do", value: "todo" as const },
    { label: "Done", value: "completed" as const },
]

type ExpandKey = "dateFrom" | "dateTo" | "hoursFrom" | "hoursTo"

export default function TimelineFilters({ route, navigation }: TimelineScreenProps<"TimelineFilters">) {
    const [filters, setFilters] = useState<TimelineFilterState>(route.params.initialFilters)
    const [expanded, setExpanded] = useState<Record<ExpandKey, boolean>>({
        dateFrom: false,
        dateTo: false,
        hoursFrom: false,
        hoursTo: false,
    })

    const toggle = (key: ExpandKey) =>
        setExpanded((p) => ({ ...p, [key]: !p[key] }))

    const set = <K extends keyof TimelineFilterState>(key: K, value: TimelineFilterState[K]) =>
        setFilters((p) => ({ ...p, [key]: value }))

    const handleApply = () => {
        applyFilters(filters)
        navigation.goBack()
    }

    const handleReset = () => {
        setFilters(DEFAULT_TIMELINE_FILTERS)
        setExpanded({ dateFrom: false, dateTo: false, hoursFrom: false, hoursTo: false })
    }

    return (
        <View style={styles.root}>
            <Background />
            <ModalHeader
                onClose={() => navigation.goBack()}
                title="Filters"
                onSave={handleApply}
                saveLabel="Apply"
            />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Section title="Search" noGap>
                    <View style={styles.searchRow}>
                        <Feather name="search" size={18} color={Colors.foreground_secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search events..."
                            placeholderTextColor={Colors.text_dark}
                            value={filters.searchText}
                            onChangeText={(t) => set("searchText", t)}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {filters.searchText.length > 0 && (
                            <Pressable onPress={() => set("searchText", "")}>
                                <Feather name="x" size={16} color={Colors.text_dark} />
                            </Pressable>
                        )}
                    </View>
                </Section>

                <Section title="Date Range">
                    <PickerRow
                        label="From"
                        value={filters.dateFrom ? dayjs(filters.dateFrom).format("DD MMM YYYY") : undefined}
                        expanded={expanded.dateFrom}
                        onToggle={() => toggle("dateFrom")}
                        onClear={() => { set("dateFrom", null); setExpanded((p) => ({ ...p, dateFrom: false })) }}
                    >
                        <Host matchContents>
                            <SwiftDatePicker
                                selection={filters.dateFrom ? dayjs(filters.dateFrom).toDate() : new Date()}
                                onDateChange={(d) => set("dateFrom", dayjs(d).format("YYYY-MM-DD"))}
                                modifiers={[datePickerStyle("graphical"), frame({ width: Layout.screen.width - 30 })]}
                            />
                        </Host>
                    </PickerRow>

                    <View style={styles.separator} />

                    <PickerRow
                        label="To"
                        value={filters.dateTo ? dayjs(filters.dateTo).format("DD MMM YYYY") : undefined}
                        expanded={expanded.dateTo}
                        onToggle={() => toggle("dateTo")}
                        onClear={() => { set("dateTo", null); setExpanded((p) => ({ ...p, dateTo: false })) }}
                        last
                    >
                        <Host matchContents>
                            <SwiftDatePicker
                                selection={filters.dateTo ? dayjs(filters.dateTo).toDate() : new Date()}
                                onDateChange={(d) => set("dateTo", dayjs(d).format("YYYY-MM-DD"))}
                                modifiers={[datePickerStyle("graphical"), frame({ width: Layout.screen.width - 30 })]}
                            />
                        </Host>
                    </PickerRow>
                </Section>

                <Section title="Hours">
                    <PickerRow
                        label="From"
                        value={filters.hoursFrom ?? undefined}
                        expanded={expanded.hoursFrom}
                        onToggle={() => toggle("hoursFrom")}
                        onClear={() => { set("hoursFrom", null); setExpanded((p) => ({ ...p, hoursFrom: false })) }}
                    >
                        <Host matchContents>
                            <SwiftDatePicker
                                selection={filters.hoursFrom ? dayjs(filters.hoursFrom, "HH:mm").toDate() : new Date()}
                                displayedComponents={["hourAndMinute"]}
                                onDateChange={(d) => set("hoursFrom", dayjs(d).format("HH:mm"))}
                                modifiers={[datePickerStyle("wheel")]}
                            />
                        </Host>
                    </PickerRow>

                    <View style={styles.separator} />

                    <PickerRow
                        label="To"
                        value={filters.hoursTo ?? undefined}
                        expanded={expanded.hoursTo}
                        onToggle={() => toggle("hoursTo")}
                        onClear={() => { set("hoursTo", null); setExpanded((p) => ({ ...p, hoursTo: false })) }}
                        last
                    >
                        <Host matchContents>
                            <SwiftDatePicker
                                selection={filters.hoursTo ? dayjs(filters.hoursTo, "HH:mm").toDate() : new Date()}
                                displayedComponents={["hourAndMinute"]}
                                onDateChange={(d) => set("hoursTo", dayjs(d).format("HH:mm"))}
                                modifiers={[datePickerStyle("wheel")]}
                            />
                        </Host>
                    </PickerRow>
                </Section>

                <Section title="Status">
                    <View style={styles.statusPad}>
                        <GroupSelector
                            size="medium"
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(v) => set("status", v)}
                        />
                    </View>
                </Section>

                <Pressable onPress={handleReset} style={styles.resetButton}>
                    <Feather name="x-circle" size={16} color={Colors.danger} />
                    <Text style={styles.resetText}>Reset All Filters</Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}

interface PickerRowProps {
    label: string
    value?: string
    expanded: boolean
    onToggle: () => void
    onClear: () => void
    last?: boolean
    children: React.ReactNode
}

function PickerRow({ label, value, expanded, onToggle, onClear, last, children }: PickerRowProps) {
    return (
        <>
            <Pressable
                onPress={onToggle}
                style={[styles.pickerRow, last && styles.pickerRowLast]}
            >
                <Text variant="subtitle" style={styles.pickerLabel}>{label}</Text>
                <View style={styles.pickerRight}>
                    <Text variant="body" style={value ? styles.pickerValueSet : styles.pickerValueEmpty}>
                        {value ?? "Any"}
                    </Text>
                    {value && (
                        <Pressable
                            onPress={(e) => { e.stopPropagation(); onClear() }}
                            hitSlop={10}
                        >
                            <Feather name="x" size={14} color={Colors.text_dark} style={styles.clearIcon} />
                        </Pressable>
                    )}
                    <Feather
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={Colors.foreground_secondary}
                    />
                </View>
            </Pressable>
            {expanded && <View style={styles.pickerExpanded}>{children}</View>}
        </>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingTop: 90,
        paddingBottom: 60,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.borderColor,
        marginHorizontal: 15,
    },
    pickerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderColor,
    },
    pickerRowLast: {
        borderBottomWidth: 0,
    },
    pickerLabel: {
        color: Colors.foreground,
    },
    pickerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    pickerValueSet: {
        color: Colors.secondary,
        fontSize: 15,
    },
    pickerValueEmpty: {
        color: Colors.text_dark,
        fontSize: 15,
    },
    clearIcon: {
        marginRight: 2,
    },
    pickerExpanded: {
        alignItems: "center",
        paddingBottom: 10,
        paddingTop: 4,
    },
    statusPad: {
        padding: 10,
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 32,
        paddingVertical: 14,
    },
    resetText: {
        color: Colors.danger,
        fontSize: 15,
    },
})
