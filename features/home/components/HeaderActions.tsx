import { AntDesign } from "@expo/vector-icons"
import Feedback from "react-native-haptic-feedback"

interface HeaderActionsProps {
    onNotificationPress: () => void
    onSettingsPress: () => void
}

export default function HeaderActions({ onNotificationPress, onSettingsPress }: HeaderActionsProps) {
    const handleNotificationPress = () => {
        Feedback.trigger("impactLight")
        onNotificationPress()
    }

    const handleSettingsPress = () => {
        Feedback.trigger("impactLight")
        onSettingsPress()
    }

    return [
        {
            icon: <AntDesign name="bells" size={20} color="#fff" />,
            onPress: handleNotificationPress,
        },
        {
            icon: <AntDesign name="setting" size={20} color="#fff" />,
            onPress: handleSettingsPress,
        },
    ]
}