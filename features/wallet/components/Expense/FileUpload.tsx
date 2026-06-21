import { FlatList, Image, Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { forwardRef, useImperativeHandle, useState } from "react"
import Ripple from "react-native-material-ripple"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Layout from "@/constants/Layout"
import Colors from "@/constants/Colors"
import ImageViewerModal from "./ImageViewer"
import Section from "@/components/ui/Section"
import ContextMenu from "react-native-context-menu-view"
import { SymbolView } from "expo-symbols"


export type ExpenseAttachmentsHandle = { takePhoto: () => void; pickImage: () => void }

const ExpenseAttachments = forwardRef<ExpenseAttachmentsHandle, { id: string; images: any[] }>((props, ref) => {
    const [files, setFiles] = useState<{ id: string; url: string }[]>(props.images ?? [])

    async function uploadPhotoAsync(photos: ImagePicker.ImagePickerResult) {
        if (photos.assets?.length === 0 || photos.canceled) return

        const photo = photos.assets[0]

        const formData = new FormData()

        const fileObject = {
            uri: photo.uri,
            name: photo.fileName || "photo.jpg",
            type: photo.type || "image/jpeg",
        }

        formData.append("file", fileObject as any)

        try {
            const { data } = await axios.post(Url.API + "/upload/single", formData, {
                params: {
                    type: "expense",
                    entityId: props.id,
                    compress: "true",
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            })

            const newFiles = Array.isArray(data) ? data : [data]
            setFiles((prev) => [...prev, ...newFiles])
            return data
        } catch (error) {
            throw error
        }
    }

    const handleTakePhoto = async () => {
        await ImagePicker.requestCameraPermissionsAsync()

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            allowsMultipleSelection: false,
            mediaTypes: "images",
            cameraType: ImagePicker.CameraType.back,
            quality: 1,
            aspect: [4, 3],
        })

        if (!result.canceled) {
            await uploadPhotoAsync(result)
        }
    }

    const handleImagesSelect = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsMultipleSelection: false,
            })

            if (!result.canceled) {
                await uploadPhotoAsync(result)
            }
        } catch (error) {
            console.error("Error selecting image:", error)
        }
    }

    useImperativeHandle(ref, () => ({
        takePhoto: handleTakePhoto,
        pickImage: handleImagesSelect,
    }))

    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <View style={{ paddingHorizontal: 15 }}>
            <Section
                title="Attachments"
                headerRight={
                    <ContextMenu
                        dropdownMenuMode
                        actions={[
                            { title: "Take Photo", systemIcon: "camera.fill" },
                            { title: "Choose from Library", systemIcon: "photo.on.rectangle.angled" },
                        ]}
                        onPress={(e) => {
                            if (e.nativeEvent.index === 0) handleTakePhoto()
                            else handleImagesSelect()
                        }}
                    >
                        <Pressable style={{ padding: 2 }}>
                            <SymbolView name="plus.circle.fill" size={18} tintColor={Colors.secondary} />
                        </Pressable>
                    </ContextMenu>
                }
            >
                {files.length === 0 ? (
                    <View style={styles.emptyFiles}>
                        <Text size={13} color={Colors.text_dark} align="center">
                            No attachments yet
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        horizontal
                        data={files}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Ripple onPress={() => setSelectedImage((p) => (p === item.url ? null : item.url))}>
                                <Image
                                    source={{ uri: Url.API + "/upload/images/" + item?.url }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </Ripple>
                        )}
                    />
                )}
            </Section>

            <ImageViewerModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
        </View>
    )
})

export default ExpenseAttachments

const styles = StyleSheet.create({
    emptyFiles: {
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    image: {
        width: Layout.screen.width - 45,
        height: 250,
        borderRadius: 10,
        marginRight: 10,
    },
})
