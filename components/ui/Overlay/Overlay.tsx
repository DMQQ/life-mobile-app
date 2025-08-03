import { ReactNode } from "react"
import { Modal, Pressable } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import Layout from "../../../constants/Layout"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function Overlay(props: {
    onClose: () => void
    isVisible: boolean
    content?: ReactNode
    children?: ReactNode
    opacity?: number
}) {
    return (
        <Modal visible={props.isVisible} transparent>
            <AnimatedPressable
                entering={FadeIn}
                exiting={FadeOut}
                onPress={() => props.onClose()}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: Layout.screen.width,
                    height: Layout.screen.height,

                    backgroundColor: `rgba(0,0,0,${props.opacity || 0.5})`,
                }}
            />
            {props.children || props.content}
        </Modal>
    )
}
