import { StyleSheet, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Body, Caption } from "@/components"
import Colors from "@/constants/Colors"
import Color from "color"
import ShopImage from "./ShopImage"
import Touch from "@/components/ui/Touch"
import type { ShopItem } from "../../hooks/useShops"

interface ShopSelectCardProps {
    shop: ShopItem
    selected?: boolean
    onPress: () => void
}

export default function ShopSelectCard({ shop, selected = false, onPress }: ShopSelectCardProps) {
    return (
        <Touch onPress={onPress} style={[styles.row, selected && styles.rowSelected]}>
            <ShopImage image={shop.image} size={40} radius={12} />

            <View style={styles.info}>
                <Body style={styles.name} numberOfLines={1}>
                    {shop.name}
                </Body>
                {shop.location?.name && (
                    <Caption numberOfLines={1} style={styles.location}>
                        {shop.location.name}
                    </Caption>
                )}
            </View>

            <View style={[styles.check, selected && styles.checkActive]}>
                {selected && <Feather name="check" size={12} color={Colors.primary} />}
            </View>
        </Touch>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderRadius: 14,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.6).string(),
    },
    rowSelected: {
        backgroundColor: Color(Colors.secondary).alpha(0.08).string(),
    },
    info: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontWeight: "500",
        fontSize: 15,
    },
    location: {
        color: Colors.foreground_secondary,
    },
    check: {
        width: 22,
        height: 22,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: Colors.foreground_secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    checkActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
})
