import { Image, StyleSheet } from "react-native"
import { SymbolView } from "expo-symbols"
import GlassView from "@/components/ui/GlassView"
import Url from "@/constants/Url"
import Colors from "@/constants/Colors"

interface ShopImageProps {
    image?: string | null
    size?: number
    radius?: number
}

export default function ShopImage({ image, size = 48, radius = 14 }: ShopImageProps) {
    if (image) {
        return (
            <Image
                source={{ uri: Url.API + "/upload/images/" + image }}
                style={{ width: size, height: size, borderRadius: radius }}
                resizeMode="cover"
            />
        )
    }

    return (
        <GlassView style={[styles.placeholder, { width: size, height: size, borderRadius: radius }]}>
            <SymbolView name="storefront.fill" size={size * 0.38} tintColor={Colors.foreground_secondary} />
        </GlassView>
    )
}

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
    },
})
