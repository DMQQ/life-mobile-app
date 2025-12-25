import Color from "color"
import { LiquidGlassView, LiquidGlassViewProps } from "@callstack/liquid-glass"
import { PropsWithChildren } from "react"
import Colors from "@/constants/Colors"

const tint = Color(Colors.primary_darker).alpha(0.5).toString()

export default function GlassView({ children, ...rest }: PropsWithChildren<LiquidGlassViewProps>) {
    return (
        <LiquidGlassView effect="clear" tintColor={tint} interactive {...rest}>
            {children}
        </LiquidGlassView>
    )
}
