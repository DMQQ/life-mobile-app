import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import React from "react"
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"

export const CARD_BG = Color(Colors.primary).lighten(0.4).string()
export const SEPARATOR = "rgba(255,255,255,0.08)"
export const ICON_SIZE = 32

export function SectionLabel({ title }: { title: string }) {
    return <Text style={s.sectionLabel}>{title}</Text>
}

export function Card({ children }: { children: React.ReactNode }) {
    return <View style={s.card}>{children}</View>
}

export function SettingsRow({
    icon,
    label,
    right,
    onPress,
    isLast,
}: {
    icon: React.ReactNode
    label: string
    right?: React.ReactNode
    onPress?: () => void
    isLast?: boolean
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.65 : 1} style={[s.row, !isLast && s.rowBorder]}>
            {icon}
            <Text variant="body" style={s.rowLabel}>
                {label}
            </Text>
            {right && <View style={s.rowRight}>{right}</View>}
        </TouchableOpacity>
    )
}

export function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
    return <View style={[s.iconBox, { backgroundColor: bg }]}>{children}</View>
}

export function ToggleRow({
    label,
    subtitle,
    value,
    onChange,
    disabled,
    isLast,
}: {
    label: string
    subtitle?: string
    value: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
    isLast?: boolean
}) {
    return (
        <View style={[s.toggleRow, !isLast && s.rowBorder]}>
            <View style={{ flex: 1 }}>
                <Text style={[s.toggleLabel, disabled && { opacity: 0.45 }]}>{label}</Text>
                {subtitle && <Text style={[s.toggleSub, disabled && { opacity: 0.45 }]}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={(v) => {
                    Feedback.trigger("selection")
                    onChange(v)
                }}
                disabled={disabled}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: Colors.secondary }}
                thumbColor={value ? Colors.primary : "rgba(255,255,255,0.85)"}
            />
        </View>
    )
}

const s = StyleSheet.create({
    sectionLabel: {
        color: Colors.text_dark,
        fontSize: 11.5,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 7,
        marginLeft: 4,
    },
    card: { backgroundColor: CARD_BG, borderRadius: 20, overflow: "hidden" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 50,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SEPARATOR },
    iconBox: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: { flex: 1, color: Colors.text_light },
    rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 46,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 12,
    },
    toggleLabel: { flex: 1, color: Colors.text_light, fontSize: 15 },
    toggleSub: { color: Colors.foreground_secondary, fontSize: 12, marginTop: 1 },
})
