import { ReactNode } from "react"
import { FlatList, Image, StyleSheet, Text, View } from "react-native"
import { forwardRef, useImperativeHandle, useState } from "react"
import Ripple from "react-native-material-ripple"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Layout from "@/constants/Layout"
import Colors from "@/constants/Colors"
import ImageViewerModal from "./ImageViewer"

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
    <Text
        style={{
            color: props.color ?? Colors.secondary,
            fontSize: props.size,
            fontWeight: "bold",
            lineHeight: props.size + 7.5,
        }}
    >
        {props.children}
    </Text>
)

export type FileUploadHandle = { takePhoto: () => void; pickImage: () => void }

const FileUpload = forwardRef<FileUploadHandle, { id: string; images: any[] }>((props, ref) => {
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

    if (files.length === 0) return null

    return (
        <View style={{ paddingHorizontal: 15, marginBottom: 40 }}>
            <Txt size={20} color={Colors.foreground}>
                Attachments
            </Txt>
            <FlatList
                style={{ marginTop: 25 }}
                horizontal
                data={files}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Ripple
                        onPress={() => {
                            setSelectedImage((p) => (p === item.url ? null : item.url))
                        }}
                    >
                        <Image
                            source={{
                                uri: Url.API + "/upload/images/" + item?.url,
                            }}
                            style={{
                                width: Layout.screen.width - 45,
                                height: 250,
                                borderRadius: 10,
                                marginRight: 10,
                            }}
                            resizeMode="cover"
                        />
                    </Ripple>
                )}
            />

            <ImageViewerModal
                selectedImage={selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                }}
            />
        </View>
    )
})

export default FileUpload

const styles = StyleSheet.create({})
