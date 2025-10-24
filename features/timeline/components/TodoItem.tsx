import { Card } from "@/components"
import Checkbox from "@/components/ui/Checkbox"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Todos } from "@/types"
import dayjs from "dayjs"
import { useRef, useState } from "react"
import { ActivityIndicator, StyleSheet, View, TouchableOpacity, ScrollView, Alert, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Haptic from "react-native-haptic-feedback"
import { FadeInDown, FadeOutDown } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"
import useAddTodoFile from "../hooks/mutation/useAddTodoFile"
import useRemoveTodoFile from "../hooks/mutation/useRemoveTodoFile"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Color from "color"
import { gql, useApolloClient } from "@apollo/client"
import { GET_TIMELINE } from "../hooks/query/useGetTimelineById"

const styles = StyleSheet.create({
    todoCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    todoContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    todoText: {
        marginLeft: 16,
        lineHeight: 24,
        flex: 1,
    },
    checkbox: {},
    completedText: {
        textDecorationLine: "line-through",
        opacity: 0.6,
    },
    filesContainer: {
        marginTop: 8,
        width: "100%",
    },
    fileItem: {
        alignItems: "center",
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: Color(Colors.primary_lighter).lighten(0.5).toString(),
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).lighten(0.75).toString(),
    },
    fileName: {
        fontSize: 10,
        color: Colors.foreground_secondary,
        marginTop: 4,
        textAlign: "center",
    },
    fileImage: {
        width: 50,
        height: 40,
        borderRadius: 4,
    },
    fileIcon: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.secondary_light_1,
        borderRadius: 8,
    },
    uploadButton: {
        padding: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
})

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "image-outline"
    if (type.includes("pdf")) return "document-text-outline"
    if (type.includes("video")) return "videocam-outline"
    if (type.includes("audio")) return "musical-notes-outline"
    return "document-outline"
}

export default function TodoItem(todo: Todos & { timelineId: string; index: number }) {
    const navigation = useNavigation()
    const [removeTodo, { loading: removeLoading }] = useRemoveTodo(todo)
    const [completeTodo, { loading: completeLoading }] = useCompleteTodo({
        todoId: todo.id,
        timelineId: todo.timelineId,
        currentlyCompleted: todo.isCompleted,
    })
    const { addTodoFile, loading: addFileLoading } = useAddTodoFile()
    const { removeTodoFile, loading: removeFileLoading } = useRemoveTodoFile()
    const [uploadingFile, setUploadingFile] = useState(false)

    const client = useApolloClient()

    const tapCountRef = useRef(0)
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isProcessingRef = useRef(false)

    const handleToggleComplete = () => {
        if (isProcessingRef.current) return

        tapCountRef.current += 1

        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current)
        }

        if (tapCountRef.current === 1) {
            tapTimeoutRef.current = setTimeout(() => {
                tapCountRef.current = 0
            }, 300)
        } else if (tapCountRef.current === 2) {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current)
            }
            tapCountRef.current = 0
            isProcessingRef.current = true

            Haptic.trigger("impactLight")

            completeTodo(!todo.isCompleted)
                .then((result) => {
                    console.log("Mutation completed:", result)
                    isProcessingRef.current = false
                })
                .catch((error) => {
                    console.error("Mutation error:", error)
                    isProcessingRef.current = false
                })
        }
    }

    const handleRemoveTodo = () => {
        Haptic.trigger("impactLight")
        removeTodo()
    }

    const handleUploadFile = () => {
        Alert.alert("Add File", "Choose file type", [
            { text: "Camera", onPress: handleImageFromCamera },
            { text: "Photo Library", onPress: handleImageFromLibrary },
            { text: "Document", onPress: handleDocumentPicker },
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

    const handleDocumentPicker = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
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

            const response = await axios.post(Url.API + "/upload/todo-file", formData, {
                params: {
                    todoId: todo.id,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            // Debug response and update cache
            console.log("Upload response:", response.data)
            
            // Update cache immediately with the uploaded file
            const uploadedFile = response.data
            if (uploadedFile && uploadedFile.id) {
                const timelineData = client.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: todo.timelineId },
                }) as any

                if (timelineData) {
                    const updatedTodos = timelineData.timelineById.todos.map((t: any) => {
                        if (t.id === todo.id) {
                            return {
                                ...t,
                                files: [...(t.files || []), uploadedFile],
                            }
                        }
                        return t
                    })

                    client.writeQuery({
                        query: GET_TIMELINE,
                        variables: { id: todo.timelineId },
                        data: {
                            timelineById: {
                                ...timelineData.timelineById,
                                todos: updatedTodos,
                            },
                        },
                    })
                }
                
                Haptic.trigger("impactLight")
                return // Skip the refetch since we updated cache directly
            }
            
            // Fallback: Refetch the specific todo to get updated files
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
                variables: { id: todo.id },
                fetchPolicy: 'network-only'
            })

            // Update cache with the refetched todo data
            if (updatedTodo?.timelineTodo) {
                const timelineData = client.readQuery({
                    query: GET_TIMELINE,
                    variables: { id: todo.timelineId },
                }) as any

                if (timelineData) {
                    const updatedTodos = timelineData.timelineById.todos.map((t: any) => {
                        if (t.id === todo.id) {
                            return {
                                ...t,
                                files: updatedTodo.timelineTodo.files,
                            }
                        }
                        return t
                    })

                    client.writeQuery({
                        query: GET_TIMELINE,
                        variables: { id: todo.timelineId },
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

    const handleRemoveFile = (fileId: string) => {
        Alert.alert("Remove File", "Are you sure you want to remove this file?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        await removeTodoFile({
                            variables: { fileId },
                            refetchQueries: ["GetTimeline"],
                        })
                        Haptic.trigger("impactLight")
                    } catch (error) {
                        console.error("Remove file error:", error)
                        Alert.alert("Error", "Failed to remove file")
                    }
                },
            },
        ])
    }

    const handleShowPreview = (file: any) => {
        ;(navigation as any).navigate("ImagesPreview", {
            selectedImage: file.url,
            timelineId: todo.timelineId,
        })
    }

    const isLoading = removeLoading || completeLoading || addFileLoading || removeFileLoading || uploadingFile

    return (
        <Card animated entering={FadeInDown.delay(todo.index * 50)} exiting={FadeOutDown} style={{ marginBottom: 15 }}>
            <View style={styles.todoCard}>
                <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    onLongPress={handleRemoveTodo}
                    onPress={handleToggleComplete}
                >
                    <View style={styles.checkbox}>
                        {isLoading ? (
                            <>
                                {completeLoading && <ActivityIndicator size="small" color={Colors.secondary} />}
                                {removeLoading && <ActivityIndicator size="small" color={Colors.error} />}
                            </>
                        ) : (
                            <Checkbox checked={todo.isCompleted} onPress={handleToggleComplete} size={28} />
                        )}
                    </View>

                    <View style={{ flex: 1, gap: 5 }}>
                        <Text
                            variant="subtitle"
                            color={todo.isCompleted ? Colors.secondary_light_1 : Colors.text_light}
                            style={[styles.todoText, todo.isCompleted && styles.completedText]}
                        >
                            {todo.title.trim()}
                        </Text>

                        <Text
                            variant="caption"
                            color={Colors.text_dark}
                            style={{ fontSize: 12, marginLeft: styles.todoText.marginLeft }}
                        >
                            {dayjs(todo.modifiedAt).format("HH:mm - DD/MM")}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadFile} disabled={isLoading}>
                    <Ionicons name="attach" size={24} color={"#fff"} />
                </TouchableOpacity>
            </View>

            {todo.files && todo.files.length > 0 && (
                <View style={styles.filesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {todo.files.map((file) => (
                            <TouchableOpacity
                                key={file.id}
                                style={styles.fileItem}
                                onPress={() => {
                                    if (file.type.startsWith("image/")) {
                                        handleShowPreview(file)
                                    } else {
                                        // TODO: Handle other file types
                                        console.log("File pressed:", file.url)
                                    }
                                }}
                                onLongPress={() => handleRemoveFile(file.id)}
                            >
                                {file.type.startsWith("image/") ? (
                                    <Image
                                        source={{ uri: Url.API + "/upload/images/" + file.url }}
                                        style={styles.fileImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.fileIcon}>
                                        <Ionicons
                                            name={getFileIcon(file.type) as any}
                                            size={24}
                                            color={Colors.secondary}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </Card>
    )
}
