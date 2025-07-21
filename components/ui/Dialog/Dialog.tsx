import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign } from "@expo/vector-icons"
import { useState } from "react"
import { ActivityIndicator, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Text from "@/components/ui/Text/Text"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import Button, { ButtonProps } from "../Button/Button"
import IconButton from "../IconButton/IconButton"
import Overlay from "../Overlay/Overlay"

interface DialogProps {
    isVisible?: boolean
    onDismiss: () => void
    children?: React.ReactNode
    title: string
    description?: string
    buttons?: ButtonProps[]

    icon?: React.ReactNode
    iconPosition?: "center" | "left" | "top-left" | "top-right"
    iconBackground?: boolean
    iconBackgroundColor?: string
    iconBackgroundSize?: number

    showCloseButton?: boolean
    closeButtonStyle?: ViewStyle

    containerStyle?: ViewStyle
    contentStyle?: ViewStyle
    titleStyle?: TextStyle
    descriptionStyle?: TextStyle

    buttonsPosition?: "left" | "center" | "right"
    buttonsDirection?: "row" | "column"

    width?: number
    backgroundColor?: string
    borderRadius?: number
    padding?: number

    overlayOpacity?: number
    dismissOnOverlayPress?: boolean
}

export default function Dialog({
    children,
    isVisible,
    onDismiss,
    title,
    buttons,
    description,
    icon,
    iconPosition = "left",
    iconBackground = false,
    iconBackgroundColor = Colors.error,
    iconBackgroundSize = 60,
    showCloseButton = true,
    closeButtonStyle,
    containerStyle,
    contentStyle,
    titleStyle,
    descriptionStyle,
    buttonsPosition = "right",
    buttonsDirection = "row",
    width = Layout.screen.width - 30,
    backgroundColor = Colors.primary_light,
    borderRadius = 20,
    padding = 20,
    overlayOpacity = 0.5,
    dismissOnOverlayPress = true,
}: DialogProps) {
    const getIconPositionStyle = () => {
        switch (iconPosition) {
            case "center":
                return { alignItems: "center", marginBottom: 15 }
            case "left":
                return { marginBottom: 15 }
            case "top-left":
                return { position: "absolute", top: padding, left: padding, zIndex: 1 }
            case "top-right":
                return { position: "absolute", top: padding, right: padding + (showCloseButton ? 40 : 0), zIndex: 1 }
            default:
                return { marginBottom: 15 }
        }
    }

    const getButtonsJustification = () => {
        switch (buttonsPosition) {
            case "left":
                return "flex-start"
            case "center":
                return "center"
            case "right":
                return "flex-end"
            default:
                return "flex-end"
        }
    }

    const renderIcon = () => {
        if (!icon) return null

        const IconWrapper = iconBackground ? (
            <View
                style={[
                    styles.iconBackground,
                    {
                        backgroundColor: iconBackgroundColor,
                        width: iconBackgroundSize,
                        height: iconBackgroundSize,
                        borderRadius: iconBackgroundSize / 2,
                    },
                ]}
            >
                {icon}
            </View>
        ) : (
            icon
        )

        return <View style={[getIconPositionStyle() as ViewStyle]}>{IconWrapper}</View>
    }

    return (
        <Overlay
            isVisible={!!isVisible}
            onClose={dismissOnOverlayPress ? onDismiss : () => {}}
            opacity={overlayOpacity}
        >
            <View style={[styles.container, containerStyle]}>
                <Animated.View
                    entering={FadeInDown}
                    exiting={FadeOutDown}
                    style={[
                        styles.contentContainer,
                        {
                            width,
                            backgroundColor,
                            borderRadius,
                            padding,
                            gap: 10,
                        },
                        contentStyle,
                    ]}
                >
                    {(iconPosition === "top-left" || iconPosition === "top-right") && renderIcon()}

                    {showCloseButton && (
                        <IconButton
                            icon={<AntDesign name="close" size={24} color="rgba(255,255,255,0.5)" />}
                            onPress={onDismiss}
                            style={[styles.closeButton, closeButtonStyle]}
                        />
                    )}

                    {(iconPosition === "center" || iconPosition === "left") && renderIcon()}

                    <View style={{ gap: 15 }}>
                        <Text variant="subheading" style={[styles.title, titleStyle]}>{title}</Text>
                        {description && <Text variant="body" style={[styles.description, descriptionStyle]}>{description}</Text>}
                    </View>

                    <View>{children}</View>

                    {buttons && buttons.length > 0 && (
                        <View
                            style={[
                                styles.buttonsContainer,
                                {
                                    flexDirection: buttonsDirection,
                                    justifyContent: getButtonsJustification(),
                                    gap: buttonsDirection === "column" ? 10 : 10,
                                    marginTop: 15,
                                },
                            ]}
                        >
                            {buttons.map((button, index) => (
                                <DialogButton {...button} key={index} />
                            ))}
                        </View>
                    )}
                </Animated.View>
            </View>
        </Overlay>
    )
}

const DialogButton = (props: ButtonProps) => {
    const [loading, setLoading] = useState(false)
    const onPress = async (event: any) => {
        if (props.onPress) {
            setLoading(true)
            await props.onPress(event)
            setLoading(false)
        }
    }
    return (
        <Button
            variant="text"
            {...props}
            onPress={onPress}
            icon={
                loading ? (
                    <ActivityIndicator size="small" color={Colors.text_light} style={{ marginRight: 10 }} />
                ) : (
                    props.icon
                )
            }
            style={[styles.baseButton, props.style]}
            //@ts-ignore
            fontStyle={{ textTransform: "none", ...(props.fontStyle || {}) }}
        >
            {props.children}
        </Button>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        right: 15,
        top: 15,
        zIndex: 2,
    },
    iconBackground: {
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: Colors.foreground,
        fontSize: 25,
        fontWeight: "bold",
    },
    description: {
        color: Colors.foreground,
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: "row",
    },
    baseButton: {
        padding: 2.5,
        paddingHorizontal: 7.5,
        borderRadius: 5,
        flexDirection: "row-reverse",
    },
})
