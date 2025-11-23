import { SFSymbol } from "expo-symbols"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import { ContextMenu as ExpoContextMenu, Host, Button as SwiftUIButton } from "@expo/ui/swift-ui"
import Feedback from "react-native-haptic-feedback"

interface ContextMenuItemProps {
    text: string
    onPress: () => void
    destructive?: boolean
    disabled?: boolean
    leading?: SFSymbol
    trailing?: SFSymbol
    children?: React.ReactNode
    style?: StyleProp<ViewStyle>
}

interface ContextMenuProps {
    children: React.ReactNode
    items: ContextMenuItemProps[]
    anchor?: "left" | "right" | "middle"
    style?: StyleProp<ViewStyle>
}

export default function ContextMenu({ children, items, style }: ContextMenuProps) {
    return (
        <Host style={[{ flex: 1 }, style]}>
            <ExpoContextMenu activationMethod="longPress">
                <ExpoContextMenu.Items>
                    {items.map((item, index) => (
                        <SwiftUIButton
                            key={index}
                            systemImage={item.leading}
                            onPress={() => {
                                item.onPress()
                                Feedback.trigger("impactLight")
                            }}
                            role={item.destructive ? "destructive" : "default"}
                            disabled={item.disabled}
                            variant="glass"
                        >
                            {item.text}
                        </SwiftUIButton>
                    ))}
                </ExpoContextMenu.Items>
                <ExpoContextMenu.Trigger>{children}</ExpoContextMenu.Trigger>
            </ExpoContextMenu>
        </Host>
    )
}
