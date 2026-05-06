import { useState } from "react"
import Haptic from "react-native-haptic-feedback"
import { useNavigation } from "@react-navigation/native"
import useRemoveTodoFile from "./mutation/useRemoveTodoFile"

interface UseFileManagementProps {
    timelineId: string
}

export const useFileManagement = ({ timelineId }: UseFileManagementProps) => {
    const navigation = useNavigation()
    const { removeTodoFile } = useRemoveTodoFile()
    const [fileToRemove, setFileToRemove] = useState<string | null>(null)

    const confirmRemoveFile = async () => {
        if (!fileToRemove) return
        try {
            await removeTodoFile({
                variables: { fileId: fileToRemove },
                refetchQueries: ["GetTimeline"],
            })
            Haptic.trigger("impactLight")
        } catch {
        } finally {
            setFileToRemove(null)
        }
    }

    const handleShowPreview = (file: any) => {
        ;(navigation as any).navigate("ImagesPreview", {
            selectedImage: file.url,
            timelineId: timelineId,
        })
    }

    return {
        fileToRemove,
        setFileToRemove,
        confirmRemoveFile,
        handleShowPreview,
    }
}