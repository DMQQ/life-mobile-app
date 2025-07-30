import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import Url from "@/constants/Url"
import { IFile } from "@/types"
import lowOpacity from "@/utils/functions/lowOpacity"
import { useApolloClient } from "@apollo/client"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import { memo, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, ToastAndroid, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated from "react-native-reanimated"
import useGetTimelineById from "../hooks/query/useGetTimelineById"
import { transition } from "../sharedTransition"

const styles = StyleSheet.create({
    available: {
        fontSize: 16,
        fontWeight: "bold",
    },
    img: {
        width: (Layout.screen.width - 10 * 2) / 2 - 5,
        height: 130,
        marginVertical: 5,
        borderRadius: 5,
    },
    uploadButton: {
        backgroundColor: lowOpacity(Colors.secondary, 0.2),
        borderRadius: 100,
        padding: 5,
        paddingHorizontal: 15,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
})

interface FileListProps {
    timelineId: string
}

const useUploadFiles = (timelineId: string, refetch: () => Promise<any>) => {
    const client = useApolloClient()

    async function uploadPhotoAsync(photos: ImagePicker.ImagePickerResult) {
        const formData = new FormData() as any

        if (photos.assets?.length === 0 || photos.canceled) return

        photos.assets?.forEach((photo) => {
            formData.append("file", {
                uri: photo.uri,
                name: "File",
                type: "image/jpg",
            })
        })

        try {
            setLoading(true)

            const { data } = await axios.post(Url.API + "/upload", formData, {
                params: {
                    type: "timeline",
                    timelineId: timelineId,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            client.cache.modify({
                id: "TimelineEntity:" + timelineId,
                fields: {
                    images: (existingImages = []) => {
                        return [...data, ...existingImages]
                    },
                },
            })

            ToastAndroid.show(`Files uploaded (${data.length})`, ToastAndroid.SHORT)
        } catch (error) {
            ToastAndroid.show(`Couldn't upload file`, ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    const [loading, setLoading] = useState(false)

    const handleImagesSelect = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsMultipleSelection: true,
        })

        await uploadPhotoAsync(result)
    }

    return { handleImagesSelect, loading }
}

export default function FileList({ timelineId }: FileListProps) {
    const navigation = useNavigation<any>()

    const { data, refetch } = useGetTimelineById(timelineId)

    async function removePhoto(photoId: string) {
        await axios.delete(Url.API + "/upload/" + photoId)
        await refetch()
    }

    const handleShowPreview = (item: any) =>
        navigation.navigate("ImagesPreview", {
            selectedImage: item.url,
            timelineId,
        })

    const [toggleView, setToggleView] = useState(false)

    return (
        <View style={{ marginTop: 25 }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                }}
            >
                <Ripple onPress={() => setToggleView((p) => !p)}>
                    <Text style={styles.available}>Available files ({data?.images.length})</Text>
                </Ripple>
                <UploadFileButton refetch={refetch} timelineId={timelineId} />
            </View>

            <GridImageView data={data} onRemovePhoto={removePhoto} onShowPreview={handleShowPreview} />

            {/* {toggleView ? (  // app crashes here
        <GridImageView
          data={data}
          onRemovePhoto={removePhoto}
          onShowPreview={handleShowPreview}
        />
      ) : (
        <ListImageView
          data={data}
          onRemovePhoto={removePhoto}
          onShowPreview={handleShowPreview}
        />
      )} */}
        </View>
    )
}

interface ImageDisplayViewProps {
    data: { images: IFile[] }
    onRemovePhoto: (id: string) => Promise<any>
    onShowPreview: (item: IFile) => void
}

const GridImageView = memo((props: ImageDisplayViewProps) => {
    // return (
    //   <View
    //     style={{
    //       flexDirection: "row",
    //       flexWrap: "wrap",
    //       justifyContent: "space-between",
    //     }}
    //   >
    //     {props.data?.images.map((item) => (
    //       <Ripple
    //         key={item.id}
    //         onLongPress={() => props.onRemovePhoto(item.id)}
    //         onPress={() => {
    //           props.onShowPreview(item);
    //         }}
    //       >
    //         <Animated.Image
    //           sharedTransitionStyle={transition}
    //           sharedTransitionTag={`image-${item.url}`}
    //           key={item.id}
    //           style={styles.img}
    //           source={{
    //             uri: Url.API + "/upload/images/" + item.url,
    //             height: styles.img.height,
    //             width: styles.img.width,
    //           }}
    //         />
    //       </Ripple>
    //     ))}
    //   </View>
    // );

    return (
        <FlatList
            scrollEnabled={false}
            numColumns={2}
            initialNumToRender={4}
            data={props.data?.images}
            keyExtractor={(el) => el.id}
            renderItem={({ item }) => (
                <Ripple
                    style={{ marginBottom: 10 }}
                    onLongPress={() => props.onRemovePhoto(item.id)}
                    onPress={() => props.onShowPreview(item)}
                >
                    <Animated.Image
                        sharedTransitionStyle={transition}
                        sharedTransitionTag={`image-${item.url}`}
                        style={styles.img}
                        source={{
                            uri: Url.API + "/upload/images/" + item.url,
                            height: styles.img.height,
                            width: styles.img.width,
                        }}
                    />
                </Ripple>
            )}
        />
    )
})

const ListImageView = memo((props: ImageDisplayViewProps) => (
    <FlatList
        initialNumToRender={3}
        data={props.data?.images}
        horizontal
        keyExtractor={(el) => el.id}
        renderItem={({ item }) => (
            <Ripple
                style={{ marginRight: 10 }}
                onLongPress={() => props.onRemovePhoto(item.id)}
                onPress={() => props.onShowPreview(item)}
            >
                <Animated.Image
                    sharedTransitionStyle={transition}
                    sharedTransitionTag={`image-${item.url}`}
                    style={styles.img}
                    source={{
                        uri: Url.API + "/upload/images/" + item.url,
                        height: styles.img.height,
                        width: styles.img.width,
                    }}
                />
            </Ripple>
        )}
    />
))

function UploadFileButton(props: { timelineId: string; refetch: () => Promise<any> }) {
    const { handleImagesSelect, loading } = useUploadFiles(props.timelineId, props.refetch)

    return (
        <Ripple onPress={handleImagesSelect} style={styles.uploadButton}>
            {loading ? (
                <ActivityIndicator color={Colors.secondary_light_1} style={{ marginRight: 5 }} size={15} />
            ) : (
                <Ionicons style={{ marginRight: 5 }} name="create-outline" size={16} color={Colors.secondary_light_1} />
            )}

            <Text va style={{ color: Colors.secondary_light_1, fontSize: 14 }}>
                {loading ? "Uploading..." : "Upload files"}
            </Text>
        </Ripple>
    )
}
