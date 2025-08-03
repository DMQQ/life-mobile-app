import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign } from "@expo/vector-icons"
import { PropsWithChildren } from "react"
import { StyleProp, StyleSheet, TextStyle, View } from "react-native"
import Haptics from "react-native-haptic-feedback"
import Ripple, { RippleProps } from "react-native-material-ripple"
import Text from "../Text/Text"

interface ChipButtonProps extends RippleProps {
    icon?: React.ReactNode | string

    textStyle?: StyleProp<TextStyle>
}

export default function ChipButton({ children, icon, ...rest }: PropsWithChildren<ChipButtonProps>) {
    return (
        <Ripple
            {...rest}
            onPress={(ev) => {
                if (rest.onPress) {
                    rest.onPress(ev)
                }
                Haptics.trigger("impactLight")
            }}
            onLongPress={(ev) => {
                if (rest.onLongPress) {
                    rest.onLongPress(ev)
                }
                Haptics.trigger("impactMedium")
            }}
            style={[
                styles.button,
                rest.disabled
                    ? {
                          backgroundColor: lowOpacity(Colors.secondary, 0.1),
                          borderColor: lowOpacity(Colors.secondary, 0.5),
                      }
                    : {},
                rest.style,
            ]}
            rippleColor={lowOpacity(Colors.secondary, 0.35)}
        >
            {children && typeof children === "string" ? (
                <View style={styles.textContainer}>
                    {typeof icon === "string" ? (
                        <AntDesign
                            name={icon as any}
                            size={14}
                            color={rest.disabled ? Colors.secondary_dark_1 : Colors.secondary}
                        />
                    ) : (
                        icon
                    )}

                    <Text
                        variant="caption"
                        style={[
                            { fontSize: 14, color: rest.disabled ? Colors.secondary_dark_1 : Colors.secondary },
                            rest.textStyle,
                        ]}
                    >
                        {children}
                    </Text>
                </View>
            ) : (
                children
            )}
        </Ripple>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 100,
        backgroundColor: lowOpacity(Colors.secondary, 0.2),
        borderWidth: 1,
        borderColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
})
