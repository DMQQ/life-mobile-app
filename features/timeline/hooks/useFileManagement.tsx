import { Alert } from "react-native"
import Haptic from "react-native-haptic-feedback"
import { useNavigation } from "@react-navigation/native"
import useRemoveTodoFile from "./mutation/useRemoveTodoFile"

interface UseFileManagementProps {
    timelineId: string
}

export const useFileManagement = ({ timelineId }: UseFileManagementProps) => {
    const navigation = useNavigation()
    const { removeTodoFile } = useRemoveTodoFile()

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
            timelineId: timelineId,
        })
    }

    return {
        handleRemoveFile,
        handleShowPreview,
    }
}