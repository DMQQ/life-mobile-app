import { useState } from "react"
import { Alert } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Haptic from "react-native-haptic-feedback"
import { useApolloClient, gql } from "@apollo/client"
import { GET_TIMELINE } from "./query/useGetTimelineById"

interface UseFileUploadProps {
    todoId: string
    timelineId: string
}

export const useFileUpload = ({ todoId, timelineId }: UseFileUploadProps) => {
    const [uploadingFile, setUploadingFile] = useState(false)
    const client = useApolloClient()

    const handleUploadFile = () => {
        Alert.alert("Add File", "Choose file type", [
            { text: "Camera", onPress: handleImageFromCamera },
            { text: "Photo Library", onPress: handleImageFromLibrary },
            { text: "Cancel", style: "cancel" },
        ])
    }

    const handleImageFromCamera = async () => {
        await ImagePicker.requestCameraPermissionsAsync()

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            allowsMultipleSelection: false,
            mediaTypes: "images",
            cameraType: ImagePicker.CameraType.back,
            quality: 1,
            aspect: [4, 3],
        })

        if (!result.canceled && result.assets[0]) {
            await uploadFile(result.assets[0])
        }
    }

    const handleImageFromLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
            await uploadFile(result.assets[0])
        }
    }

    const uploadFile = async (asset: any) => {
        try {
            setUploadingFile(true)

            const formData = new FormData()
            formData.append("file", {
                uri: asset.uri,
                type: asset.mimeType || "application/octet-stream",
                name: asset.fileName || "file",
            } as any)

            const response = await axios.post(Url.API + "/upload/single", formData, {
                params: {
                    type: "todo",
                    entityId: todoId,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            const uploadedFile = response.data
            if (uploadedFile && uploadedFile.id) {
                const timelineData = client.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: timelineId },
                }) as any

                if (timelineData) {
                    const updatedTodos = timelineData.timelineById.todos.map((t: any) => {
                        if (t.id === todoId) {
                            return {
                                ...t,
                                files: [...(t.files || []), uploadedFile],
                            }
                        }
                        return t
                    })

                    client.writeQuery({
                        query: GET_TIMELINE,
                        variables: { id: timelineId },
                        data: {
                            timelineById: {
                                ...timelineData.timelineById,
                                todos: updatedTodos,
                            },
                        },
                    })
                }

                Haptic.trigger("impactLight")
                return
            }

            const { data: updatedTodo } = await client.query({
                query: gql`
                    query GetTodo($id: ID!) {
                        timelineTodo(id: $id) {
                            id
                            title
                            isCompleted
                            modifiedAt
                            files {
                                id
                                type
                                url
                            }
                        }
                    }
                `,
                variables: { id: todoId },
                fetchPolicy: "network-only",
            })

            if (updatedTodo?.timelineTodo) {
                const timelineData = client.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: timelineId },
                }) as any

                if (timelineData) {
                    const updatedTodos = timelineData.timelineById.todos.map((t: any) => {
                        if (t.id === todoId) {
                            return {
                                ...t,
                                files: updatedTodo.timelineTodo.files,
                            }
                        }
                        return t
                    })

                    client.writeQuery({
                        query: GET_TIMELINE,
                        variables: { id: timelineId },
                        data: {
                            timelineById: {
                                ...timelineData.timelineById,
                                todos: updatedTodos,
                            },
                        },
                    })
                }
            }

            Haptic.trigger("impactLight")
        } catch (error) {
            console.error("Upload error:", JSON.stringify(error))
            Alert.alert("Error", "Failed to upload file")
        } finally {
            setUploadingFile(false)
        }
    }

    return {
        handleUploadFile,
        uploadingFile,
    }
}
