import { StyleSheet, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import ContextMenu from "react-native-context-menu-view"
import { Card, Body, Caption } from "@/components"
import Colors from "@/constants/Colors"
import Color from "color"
import ShopImage from "./ShopImage"
import type { ShopItem } from "../../hooks/useShops"

interface ShopCardProps {
    shop: ShopItem
    onPress: () => void
    onEdit: () => void
    onDelete: () => void
}

export default function ShopCard({ shop, onPress, onEdit, onDelete }: ShopCardProps) {
    return (
        <ContextMenu
            actions={[
                { title: "Edit", systemIcon: "pencil" },
                { title: "Delete", systemIcon: "trash", destructive: true },
            ]}
            onPress={(e) => {
                if (e.nativeEvent.index === 0) onEdit()
                else if (e.nativeEvent.index === 1) onDelete()
            }}
            previewBackgroundColor={Color(Colors.primary_lighter).string()}
        >
            <Card onPress={onPress} style={styles.card}>
                <ShopImage image={shop.image} size={52} radius={14} />

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

                <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
            </Card>
        </ContextMenu>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 12,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    name: {
        fontWeight: "600",
    },
    location: {
        color: Colors.foreground_secondary,
    },
})
