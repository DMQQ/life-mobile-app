import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import ContextMenu from "@/components/ui/ContextMenu"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"
import Color from "color"
import type { CorrectionMap } from "../../hooks/useCorrectionMaps"
import { CategoryIcon, Icons } from "../Expense/ExpenseIcon"

interface Props {
    item: CorrectionMap
    onEdit: (item: CorrectionMap) => void
    onDelete: (id: string) => void
    onToggle: (item: CorrectionMap) => void
}

function Tag({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.tag}>
            <Text style={styles.tagLabel}>{label}</Text>
            <Text style={styles.tagValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    )
}

export default function CorrectionMapItem({ item, onEdit, onDelete, onToggle }: Props) {
    const hasAmountRange = item.matchAmountMin !== null || item.matchAmountMax !== null

    return (
        <ContextMenu
            anchor="right"
            items={[
                {
                    text: "Edit",
                    leading: "pencil",
                    onPress: () => onEdit(item),
                },
                {
                    text: item.isActive ? "Disable" : "Enable",
                    leading: item.isActive ? "pause.circle" : "play.circle",
                    onPress: () => onToggle(item),
                },
                {
                    text: "Delete",
                    leading: "trash",
                    destructive: true,
                    onPress: () => onDelete(item.id),
                },
            ]}
        >
            <Pressable style={[styles.card, !item.isActive && styles.cardInactive]}>
                <View style={styles.row}>
                    {/* Match side */}
                    <View style={styles.side}>
                        <Text style={styles.sideLabel}>Match</Text>
                        <View style={styles.tags}>
                            {item.matchShop && <Tag label="shop" value={item.matchShop} />}
                            {item.matchDescription && <Tag label="desc" value={item.matchDescription} />}
                            {item.matchCategory && (
                                <View style={styles.categoryTag}>
                                    <CategoryIcon
                                        category={item.matchCategory as keyof typeof Icons}
                                        type="expense"
                                        size={14}
                                    />
                                    <Text style={styles.tagValue}>{item.matchCategory}</Text>
                                </View>
                            )}
                            {hasAmountRange && (
                                <Tag
                                    label="amt"
                                    value={`${item.matchAmountMin ?? "0"}–${item.matchAmountMax ?? "∞"} zł`}
                                />
                            )}
                        </View>
                    </View>

                    {/* Arrow */}
                    <AntDesign name="arrow-right" size={16} color={Colors.secondary} style={styles.arrow} />

                    {/* Override side */}
                    <View style={styles.side}>
                        <Text style={styles.sideLabel}>Override</Text>
                        <View style={styles.tags}>
                            {item.overrideShop && <Tag label="shop" value={item.overrideShop} />}
                            {item.overrideCategory && (
                                <View style={styles.categoryTag}>
                                    <CategoryIcon
                                        category={item.overrideCategory as keyof typeof Icons}
                                        type="expense"
                                        size={14}
                                    />
                                    <Text style={styles.tagValue}>{item.overrideCategory}</Text>
                                </View>
                            )}
                            {item.overrideDescription && <Tag label="desc" value={item.overrideDescription} />}
                        </View>
                    </View>

                    {/* Status dot */}
                    <View style={[styles.dot, item.isActive ? styles.dotActive : styles.dotInactive]} />
                </View>
            </Pressable>
        </ContextMenu>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Color(Colors.primary).lighten(0.15).hex(),
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Color(Colors.primary).lighten(0.25).hex(),
    },
    cardInactive: {
        opacity: 0.45,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    side: {
        flex: 1,
    },
    sideLabel: {
        fontSize: 11,
        color: Colors.foreground_secondary,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
    },
    tag: {
        backgroundColor: Color(Colors.primary).lighten(0.3).hex(),
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        maxWidth: 120,
    },
    categoryTag: {
        backgroundColor: Color(Colors.primary).lighten(0.3).hex(),
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        maxWidth: 120,
    },
    tagLabel: {
        fontSize: 10,
        color: Colors.foreground_secondary,
        fontWeight: "600",
    },
    tagValue: {
        fontSize: 12,
        color: Colors.foreground,
        fontWeight: "500",
        flexShrink: 1,
    },
    arrow: {
        marginHorizontal: 8,
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 4,
        marginLeft: 6,
    },
    dotActive: {
        backgroundColor: "#34c759",
    },
    dotInactive: {
        backgroundColor: Colors.foreground_secondary,
    },
})
