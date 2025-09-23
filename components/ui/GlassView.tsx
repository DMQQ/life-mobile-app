import Color from "color"
import { GlassView as GlassViewOriginal, GlassViewProps } from "expo-glass-effect"
import { PropsWithChildren } from "react"
import Colors from "@/constants/Colors"

const tint = Color(Colors.primary).alpha(0.5).toString()

export default function GlassView({ children, ...rest }: PropsWithChildren<GlassViewProps>) {
    return (
        <GlassViewOriginal glassEffectStyle="clear" tintColor={tint} isInteractive {...rest}>
            {children}
        </GlassViewOriginal>
    )
}
