import { Card, ConfirmDialog } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { TodoFile, Todos } from "@/types"
import dayjs from "dayjs"
import { StyleSheet, View, TouchableOpacity, Image, Pressable } from "react-native"
import Haptic from "react-native-haptic-feedback"
import { FadeInDown, FadeOutDown } from "react-native-reanimated"
import useCompleteTodo from "../hooks/mutation/useCompleteTodo"
import useRemoveTodo from "../hooks/mutation/useRemoveTodo"
import useAddTodoFile from "../hooks/mutation/useAddTodoFile"
import useRemoveTodoFile from "../hooks/mutation/useRemoveTodoFile"
import { Feather } from "@expo/vector-icons"
import Url from "@/constants/Url"
import Color from "color"
import { useFileUpload } from "../hooks/useFileUpload"
import { useFileManagement } from "../hooks/useFileManagement"
import { UploadButton } from "./UploadButton"
import Checkbox from "@/components/ui/Checkbox"

const styles = StyleSheet.create({
    container: {
        borderWidth: 0,
        margin: 0,
        borderBottomWidth: 1,
    },
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
        borderRadius: 10,
        backgroundColor: Colors.borderColor,
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
        borderRadius: 10,
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

const getFileIcon = (type: string): React.ComponentProps<typeof Feather>["name"] => {
    if (type.startsWith("image/")) return "image"
    if (type.includes("pdf")) return "file-text"
    if (type.includes("video")) return "video"
    if (type.includes("audio")) return "music"
    return "file"
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

    const { handleUploadFile, uploadingFile } = useFileUpload({
        todoId: todo.id,
        timelineId: todo.timelineId,
    })

    const { fileToRemove, setFileToRemove, confirmRemoveFile, handleShowPreview } = useFileManagement({
        timelineId: todo.timelineId,
    })

    const handleRemoveTodo = () => {
        Haptic.trigger("impactLight")
        removeTodo()
    }

    const isLoading = removeLoading || completeLoading || addFileLoading || removeFileLoading || uploadingFile

    return (
        <>
            <Card
                animated
                entering={FadeInDown.delay(todo.index * 50)}
                exiting={FadeOutDown}
                style={[styles.container]}
            >
                <View style={styles.todoCard}>
                    <Pressable
                        style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                        onLongPress={handleRemoveTodo}
                    >
                        <Checkbox
                            checked={todo.isCompleted}
                            onPress={completeTodo}
                            size={28}
                            loading={completeLoading}
                            disabled={isLoading}
                        />

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
                    </Pressable>
                    {todo.files && todo.files.length > 0 ? (
                        <FilesList
                            files={todo.files || []}
                            handleShowPreview={handleShowPreview}
                            handleRemoveFile={setFileToRemove}
                        />
                    ) : (
                        <UploadButton onPress={handleUploadFile} disabled={isLoading} />
                    )}
                </View>
            </Card>

            <ConfirmDialog
                isVisible={!!fileToRemove}
                onDismiss={() => setFileToRemove(null)}
                onConfirm={confirmRemoveFile}
                title="Remove File"
                description="Are you sure you want to remove this file?"
                destructive
            />
        </>
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
            <View style={{ flexDirection: "row", gap: 5 }}>
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
                                <Feather name={getFileIcon(file.type)} size={24} color={Colors.secondary} />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        )
    )
}
