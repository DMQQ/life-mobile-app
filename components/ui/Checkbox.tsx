import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { MaterialIcons } from "@expo/vector-icons"
import Color from "color"
import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native"
import HapticFeedback, { HapticFeedbackTypes } from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"

interface CheckboxProps {
    checked: boolean
    onPress: () => void
    size?: number
    disabled?: boolean
    style?: ViewStyle

    loading?: boolean
}

export default function Checkbox({ checked, onPress, size = 24, disabled = false, style, loading }: CheckboxProps) {
    const handlePress = () => {
        if (!disabled) {
            HapticFeedback.trigger(HapticFeedbackTypes.selection)
            onPress()
        }
    }

    return (
        <Ripple
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size * 0.25,
                },
                checked && styles.checked,
                disabled && styles.disabled,
                style,
            ]}
            onPress={handlePress}
            disabled={disabled}
            rippleColor={Colors.secondary}
            rippleOpacity={0.3}
            rippleDuration={200}
        >
            {checked && loading === false && <MaterialIcons name="check" size={size * 0.7} color={Colors.foreground} />}
            {loading && <ActivityIndicator size={size * 0.6} color={Colors.foreground} />}
        </Ripple>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
        backgroundColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
        alignItems: "center",
        justifyContent: "center",
    },
    checked: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
        shadowColor: lowOpacity(Colors.secondary, 0.5),
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.7,
        shadowRadius: 10.0,

        elevation: 5,
    },
    disabled: {
        opacity: 0.4,
    },
})
