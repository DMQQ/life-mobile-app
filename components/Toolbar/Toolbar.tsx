import { Pressable, StyleSheet, View } from "react-native"
import GlassView from "../ui/GlassView"
import { SymbolView, SymbolViewProps } from "expo-symbols"
import ContextMenuView from "react-native-context-menu-view"
import type { SFSymbol } from "sf-symbols-typescript"
import { LiquidGlassContainerView } from "@callstack/liquid-glass"
import React, { createContext, useContext } from "react"
import { LinearGradient } from "expo-linear-gradient"
import Colors from "@/constants/Colors"
import { BlurView } from "expo-blur"
import MaskedView from "@react-native-masked-view/masked-view"

const GroupContext = createContext(false)

export interface ToolbarMenuItem {
    label: string
    sfIcon?: SFSymbol
    role?: "default" | "cancel" | "destructive"
    onPress: () => void
}

interface ToolbarProps {
    children?: React.ReactNode
}

interface ToolbarItemProps {
    onPress?: () => void
    sfIcon: SymbolViewProps["name"]
    disabled?: boolean
    hidden?: boolean
    menuItems?: ToolbarMenuItem[]

    tintColor?: string
}

export default function Toolbar({ children }: ToolbarProps) {
    return (
        <LinearGradient style={styles.gradient} colors={["transparent", Colors.primary]}>
            <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={<LinearGradient colors={["transparent", "rgba(0,0,0,0.25)"]} style={{ flex: 1 }} />}
            >
                <BlurView intensity={15} style={{ flex: 1 }} />
            </MaskedView>
            <View style={{ padding: 15, paddingBottom: 30 }}>
                <LiquidGlassContainerView style={styles.container}>{children}</LiquidGlassContainerView>
            </View>
        </LinearGradient>
    )
}

Toolbar.Group = ({ children }: { children: React.ReactNode }) => (
    <GroupContext.Provider value={true}>
        <GlassView style={[styles.glass, styles.group]} interactive>
            {children}
        </GlassView>
    </GroupContext.Provider>
)

Toolbar.Item = ({ onPress, sfIcon, disabled = false, hidden, menuItems, ...rest }: ToolbarItemProps) => {
    const grouped = useContext(GroupContext)
    if (hidden) return null

    const icon = <SymbolView size={20} name={sfIcon} tintColor={rest.tintColor ?? "#fff"} />

    const ContextWrapper = grouped ? View : GlassView

    if (menuItems?.length) {
        return (
            <ContextMenuView
                previewBackgroundColor={"transparent"}
                dropdownMenuMode
                actions={menuItems.map((item) => ({
                    title: item.label,
                    systemIcon: item.sfIcon as string | undefined,
                    destructive: item.role === "destructive",
                }))}
                onPress={(e) => menuItems[e.nativeEvent.index]?.onPress()}
            >
                <ContextWrapper style={styles.glass} interactive>
                    <View style={styles.button}>{icon}</View>
                </ContextWrapper>
            </ContextMenuView>
        )
    }
    const pressable = (
        <Pressable style={styles.button} onPress={onPress} disabled={disabled}>
            {icon}
        </Pressable>
    )

    return grouped ? (
        pressable
    ) : (
        <GlassView style={styles.glass} interactive>
            {pressable}
        </GlassView>
    )
}

Toolbar.Spacer = () => <View style={styles.spacer} />

const styles = StyleSheet.create({
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    container: {
        flexDirection: "row",
        gap: 15,
    },
    glass: {
        borderRadius: 100,
    },
    group: {
        flexDirection: "row",
    },
    button: {
        padding: 15,
    },
    spacer: {
        flex: 1,
    },
})
