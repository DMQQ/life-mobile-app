import Color from "color"
import { GlassView as GlassViewOriginal, GlassViewProps } from "expo-glass-effect"
import { PropsWithChildren } from "react"
import Colors from "@/constants/Colors"

const tint = Color(Colors.primary_darker).alpha(0.1).toString()

export default function GlassView({ children, ...rest }: PropsWithChildren<GlassViewProps>) {
    return (
        <GlassViewOriginal glassEffectStyle="clear" tintColor={tint} isInteractive {...rest}>
            {children}
        </GlassViewOriginal>
    )
}
