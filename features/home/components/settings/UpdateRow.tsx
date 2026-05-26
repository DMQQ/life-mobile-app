import Colors from "@/constants/Colors"
import { useExpoUpdates } from "@/utils/hooks/useExpoUpdate"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useEffect } from "react"
import { IconBox, SettingsRow } from "./SettingsComponents"

export default function UpdateRow() {
    const { isDownloading, checkForUpdate, downloadAndRestart } = useExpoUpdates()

    useEffect(() => {
        checkForUpdate()
    }, [])

    return (
        <SettingsRow
            icon={
                <IconBox bg={Color(Colors.secondary).darken(0.3).string()}>
                    <Feather name="download" size={16} color="#fff" />
                </IconBox>
            }
            label={isDownloading ? "Updating…" : "Update App"}
            isLast
            onPress={downloadAndRestart}
        />
    )
}
