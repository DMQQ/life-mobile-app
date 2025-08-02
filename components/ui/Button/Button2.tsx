import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign } from "@expo/vector-icons"
import Ripple, { RippleProps } from "react-native-material-ripple"
import Text from "../Text/Text"

const colors = {
    primary: Colors.secondary,
    secondary: Colors.ternary,
    surface: Colors.primary,
    success: "#4CAF50",
    error: Colors.error,
    warning: Colors.warning,
}

const variants = {
    contained: (color: string) => {
        return {
            backgroundColor: color,
            borderWidth: 1,
            borderColor: color,
            shadowColor: lowOpacity(color, 0.5),
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.7,
            shadowRadius: 16.0,
            elevation: 15,
        }
    },
    outlined: (color: string) => {
        return {
            borderWidth: 1,
            borderColor: color,
            backgroundColor: "transparent",
        }
    },
    text: (color: string) => {
        return {
            backgroundColor: "transparent",
        }
    },
    tonal: (color: string) => {
        return {
            backgroundColor: lowOpacity(color, 0.2),
            borderWidth: 1,
            borderColor: color,
        }
    },
}

const textColors = {
    primary: Colors.text_light,
    secondary: Colors.text_light,
    surface: Colors.text_light,
    success: Colors.text_light,
    error: Colors.text_light,
    warning: Colors.text_light,
} as Record<keyof typeof colors, string>

interface Button2Props extends RippleProps {
    children?: React.ReactNode
    variant?: keyof typeof variants
    color?: keyof typeof colors

    icon?: React.ReactNode | string
}

export default function Button2({
    children,
    style,
    variant = "tonal",
    color = "primary",
    icon,
    ...rest
}: Button2Props) {
    const selectedColor = colors[color]
    const variantStyle = variants[variant](selectedColor)

    const getTextColor = () => {
        if (variant === "tonal" || variant === "outlined") {
            return selectedColor
        }
        return textColors[color]
    }

    return (
        <Ripple
            {...rest}
            style={[
                {
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    width: "100%",
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    flexDirection: "row",
                },
                variantStyle,
                style,
            ]}
        >
            {typeof icon === "string" ? <AntDesign name={icon as any} size={14} color={colors[color]} /> : icon}
            <Text variant="body" style={{ fontWeight: "600", color: getTextColor() }}>
                {children}
            </Text>
        </Ripple>
    )
}
