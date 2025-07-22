import PulsingIndicator from "@/components/ui/PulsingIndicator"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { View } from "react-native"

interface HeaderActionsProps {
    onNotificationPress: () => void
    onSettingsPress: () => void

    hasNotifications?: boolean
}

export default function HeaderActions({ onNotificationPress, onSettingsPress, hasNotifications }: HeaderActionsProps) {
    const handleNotificationPress = () => {
        onNotificationPress()
    }

    const handleSettingsPress = () => {
        onSettingsPress()
    }

    return [
        {
            icon: (
                <View style={{ position: "relative" }}>
                    <AntDesign name="bells" size={20} color={Colors.foreground} />
                    {hasNotifications && <PulsingIndicator />}
                </View>
            ),
            onPress: handleNotificationPress,
        },
        {
            icon: <AntDesign name="setting" size={20} color={Colors.foreground} />,
            onPress: handleSettingsPress,
        },
    ]
}
