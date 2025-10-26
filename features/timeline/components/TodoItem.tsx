import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { TodoFile, Todos } from "@/types"
import dayjs from "dayjs"
import { StyleSheet, View, TouchableOpacity, ScrollView, Image } from "react-native"
import Haptic from "react-native-haptic-feedback"
import { FadeInDown, FadeOutDown } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"
import useAddTodoFile from "../hooks/mutation/useAddTodoFile"
import useRemoveTodoFile from "../hooks/mutation/useRemoveTodoFile"
import { Ionicons } from "@expo/vector-icons"
import Url from "@/constants/Url"
import Color from "color"
import { useDoubleTapComplete } from "../hooks/useDoubleTapComplete"
import { useFileUpload } from "../hooks/useFileUpload"
import { useFileManagement } from "../hooks/useFileManagement"
import { TodoCheckbox } from "./TodoCheckbox"
import { UploadButton } from "./UploadButton"

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
    completedText: {
        textDecorationLine: "line-through",
        opacity: 0.6,
    },
    filesContainer: {
        marginTop: 2.5,
        width: "100%",
        marginLeft: 16,
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
})

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "image-outline"
    if (type.includes("pdf")) return "document-text-outline"
    if (type.includes("video")) return "videocam-outline"
    if (type.includes("audio")) return "musical-notes-outline"
    return "document-outline"
}

export default function TodoItem(todo: Todos & { timelineId: string; index: number }) {
    const [removeTodo, { loading: removeLoading }] = useRemoveTodo(todo)
    const [completeTodo, { loading: completeLoading }] = useCompleteTodo({
        todoId: todo.id,
        timelineId: todo.timelineId,
        currentlyCompleted: todo.isCompleted,
    })
    const { loading: addFileLoading } = useAddTodoFile()
    const { loading: removeFileLoading } = useRemoveTodoFile()

    const { handleToggleComplete } = useDoubleTapComplete({
        onComplete: completeTodo,
        currentlyCompleted: todo.isCompleted,
    })

    const { handleUploadFile, uploadingFile } = useFileUpload({
        todoId: todo.id,
        timelineId: todo.timelineId,
    })

    const { handleRemoveFile, handleShowPreview } = useFileManagement({
        timelineId: todo.timelineId,
    })

    const handleRemoveTodo = () => {
        Haptic.trigger("impactLight")
        removeTodo()
    }

    const isLoading = removeLoading || completeLoading || addFileLoading || removeFileLoading || uploadingFile

    return (
        <Card animated entering={FadeInDown.delay(todo.index * 50)} exiting={FadeOutDown} style={{ marginBottom: 15 }}>
            <View style={styles.todoCard}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    onLongPress={handleRemoveTodo}
                    onPress={handleToggleComplete}
                >
                    <TodoCheckbox
                        isCompleted={todo.isCompleted}
                        isLoading={isLoading}
                        completeLoading={completeLoading}
                        removeLoading={removeLoading}
                        onToggleComplete={handleToggleComplete}
                    />

                    <View style={{ flex: 1, gap: 5 }}>
                        <Text
                            variant="subtitle"
                            color={todo.isCompleted ? Colors.secondary_light_1 : Colors.text_light}
                            style={[styles.todoText, todo.isCompleted && styles.completedText]}
                        >
                            {todo.title.trim()}
                        </Text>

                        <FilesList
                            files={todo.files || []}
                            handleShowPreview={handleShowPreview}
                            handleRemoveFile={handleRemoveFile}
                        />

                        <Text
                            variant="caption"
                            color={Colors.text_dark}
                            style={{ fontSize: 12, marginLeft: styles.todoText.marginLeft }}
                        >
                            {dayjs(todo.modifiedAt).format("HH:mm - DD/MM")}
                        </Text>
                    </View>
                </TouchableOpacity>

                <UploadButton onPress={handleUploadFile} disabled={isLoading} />
            </View>
        </Card>
    )
}

interface FilesListProps {
    files: TodoFile[]

    handleShowPreview: (file: any) => void

    handleRemoveFile: (fileId: string) => void
}

const FilesList = ({ files, handleShowPreview, handleRemoveFile }: FilesListProps) => {
    return (
        files &&
        files.length > 0 && (
            <View style={styles.filesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {files.map((file) => (
                        <TouchableOpacity
                            key={file.id}
                            style={styles.fileItem}
                            onPress={() => {
                                if (file.type.startsWith("image/")) {
                                    handleShowPreview(file)
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
                                    <Ionicons name={getFileIcon(file.type) as any} size={24} color={Colors.secondary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )
    )
}
