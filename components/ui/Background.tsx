import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, View, Dimensions } from "react-native"
import Colors from "@/constants/Colors"
import Color from "color"
import { BlurView } from "expo-blur"

export default function Background() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* <LinearGradient
                style={StyleSheet.absoluteFill}
                colors={[
                    Color(Colors.secondary).darken(0.7).alpha(0.025).string(),

                    Colors.primary_darker,

                    Colors.primary,

                    Colors.primary_darker,

                    Color(Colors.secondary).darken(0.7).alpha(0.05).string(),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={50} style={StyleSheet.absoluteFill} /> */}
        </View>
    )
}
