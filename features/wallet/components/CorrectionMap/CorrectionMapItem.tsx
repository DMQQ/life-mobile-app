import { formatAmount } from "@/utils/functions/formatCurrency"
import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import ContextMenu from "react-native-context-menu-view"
import { StyleSheet, View } from "react-native"
import Color from "color"
import type { CorrectionMap } from "../../hooks/useCorrectionMaps"
import { CategoryIcon, Icons } from "../Expense/ExpenseIcon"

interface Props {
    item: CorrectionMap
    onEdit: (item: CorrectionMap) => void
    onDelete: (id: string) => void
    onToggle: (item: CorrectionMap) => void
}

const FIELD_LABELS: Record<string, string> = {
    shop: "shop",
    desc: "desc",
    category: "cat",
    amount: "amt",
}

function matchDescription(item: CorrectionMap): { field: string; value: string; isCategory?: boolean } | null {
    if (item.matchShop) return { field: "shop", value: item.matchShop }
    if (item.matchDescription) return { field: "desc", value: item.matchDescription }
    if (item.matchCategory) return { field: "category", value: item.matchCategory, isCategory: true }
    if (item.matchAmountMin !== null || item.matchAmountMax !== null) {
        return { field: "amount", value: `${formatAmount(item.matchAmountMin ?? 0, 0)}–${item.matchAmountMax != null ? formatAmount(item.matchAmountMax, 0) : "∞"} zł` }
    }
    return null
}

function overrideLines(item: CorrectionMap): Array<{ field: string; value: string; isCategory?: boolean }> {
    const lines: Array<{ field: string; value: string; isCategory?: boolean }> = []
    if (item.overrideShop) lines.push({ field: "shop", value: item.overrideShop })
    if (item.overrideCategory) lines.push({ field: "category", value: item.overrideCategory, isCategory: true })
    if (item.overrideDescription) lines.push({ field: "desc", value: item.overrideDescription })
    return lines
}

function FieldRow({
    prefix,
    field,
    value,
    isCategory,
    accentColor,
}: {
    prefix: string
    field: string
    value: string
    isCategory?: boolean
    accentColor: string
}) {
    return (
        <View style={styles.fieldRow}>
            <View style={[styles.prefixBadge, { borderColor: Color(accentColor).alpha(0.3).string() }]}>
                <Text style={[styles.prefixText, { color: accentColor }]}>{prefix}</Text>
            </View>
            <View style={[styles.fieldBadge]}>
                <Text style={styles.fieldLabel}>{FIELD_LABELS[field] ?? field}</Text>
            </View>
            {isCategory ? (
                <View style={styles.categoryRow}>
                    <CategoryIcon category={value as keyof typeof Icons} type="expense" size={12} />
                    <Text style={styles.fieldValue} numberOfLines={1}>
                        {value}
                    </Text>
                </View>
            ) : (
                <Text style={styles.fieldValue} numberOfLines={1}>
                    {value}
                </Text>
            )}
        </View>
    )
}

export default function CorrectionMapItem({ item, onEdit, onDelete, onToggle }: Props) {
    const match = matchDescription(item)
    const overrides = overrideLines(item)
    const accentColor = item.isActive ? Colors.secondary : Colors.foreground_disabled

    return (
        <ContextMenu
            previewBackgroundColor={"transparent"}
            actions={[
                { title: "Edit", systemIcon: "pencil" },
                {
                    title: item.isActive ? "Disable" : "Enable",
                    systemIcon: item.isActive ? "pause.circle" : "play.circle",
                },
                { title: "Delete", systemIcon: "trash", destructive: true },
            ]}
            onPress={({ nativeEvent }) => {
                if (nativeEvent.index === 0) onEdit(item)
                else if (nativeEvent.index === 1) onToggle(item)
                else if (nativeEvent.index === 2) onDelete(item.id)
            }}
        >
            <View style={[styles.card, !item.isActive && styles.cardInactive]}>
                <View style={styles.content}>
                    {/* Header row: status */}
                    <View style={styles.headerRow}>
                        <View style={[styles.statusPill, { backgroundColor: Color(accentColor).alpha(0.12).string() }]}>
                            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
                            <Text style={[styles.statusText, { color: accentColor }]}>
                                {item.isActive ? "Active" : "Paused"}
                            </Text>
                        </View>
                    </View>

                    {/* Match row */}
                    {match && (
                        <FieldRow
                            prefix="IF"
                            field={match.field}
                            value={match.value}
                            isCategory={match.isCategory}
                            accentColor={accentColor}
                        />
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Override rows */}
                    {overrides.map((o, i) => (
                        <FieldRow
                            key={i}
                            prefix="→"
                            field={o.field}
                            value={o.value}
                            isCategory={o.isCategory}
                            accentColor={accentColor}
                        />
                    ))}
                </View>
            </View>
        </ContextMenu>
    )
}

const cardBg = Color(Colors.primary).lighten(0.15).hex()
const cardBorder = Color(Colors.primary).lighten(0.28).hex()
const badgeBg = Color(Colors.primary).lighten(0.3).hex()

const styles = StyleSheet.create({
    card: {
        backgroundColor: cardBg,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: cardBorder,
        marginBottom: 10,
        overflow: "hidden",
    },
    cardInactive: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 13,
        gap: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 100,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontFamily: FONTS.semibold,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    prefixBadge: {
        width: 26,
        height: 20,
        borderRadius: 5,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    prefixText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.3,
    },
    fieldBadge: {
        backgroundColor: badgeBg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
    },
    fieldLabel: {
        fontSize: 10,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    fieldValue: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        color: Colors.foreground,
        flexShrink: 1,
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexShrink: 1,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: cardBorder,
        marginVertical: 2,
    },
})
