import { useState } from "react"
import { Image, StyleSheet } from "react-native"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Feedback from "react-native-haptic-feedback"
import Section from "@/components/ui/Section"
import ActionRow from "@/components/ui/ActionRow"
import useSetShopImage from "../../hooks/useSetShopImage"
import { useExpense } from "../../pages/ExpenseContext"

interface Props {
    onUpdate: React.Dispatch<React.SetStateAction<any>>
}

export default function ShopSection({ onUpdate }: Props) {
    const expense = useExpense()
    const [loading, setLoading] = useState(false)
    const [setShopImageMutation] = useSetShopImage()

    const shopEntity = expense.shopEntity
    if (!shopEntity) return null

    const handleSetImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!granted) return

        const picked = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })
        if (picked.canceled || !picked.assets?.[0]) return

        const photo = picked.assets[0]
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", { uri: photo.uri, name: photo.fileName || "shop.jpg", type: "image/jpeg" } as any)
            const { data: uploadData } = await axios.post(Url.API + "/upload/single", formData, {
                params: { type: "shop", entityId: shopEntity.id },
                headers: { "Content-Type": "multipart/form-data" },
            })
            const imageUrl = Array.isArray(uploadData) ? uploadData[0].url : uploadData.url
            const result = await setShopImageMutation({ variables: { shopId: shopEntity.id, imageUrl } })
            if (result.data?.setShopImage) {
                onUpdate((prev: any) => ({
                    ...prev,
                    shopEntity: { ...prev.shopEntity, image: result.data!.setShopImage.image },
                }))
                Feedback.trigger("impactMedium")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Shop">
            {shopEntity.image && (
                <Image source={{ uri: shopEntity.image }} style={styles.image} resizeMode="cover" />
            )}
            <ActionRow
                icon="image"
                label={shopEntity.image ? "Update shop image" : "Set shop image"}
                onPress={handleSetImage}
                loading={loading}
                last
            />
        </Section>
    )
}

const styles = StyleSheet.create({
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        margin: 15,
    },
})
