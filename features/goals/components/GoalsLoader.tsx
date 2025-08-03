import { Skeleton } from "@/components"
import Colors from "@/constants/Colors"
import { StyleSheet, View } from "react-native"
import Animated, { FadeOut } from "react-native-reanimated"

const AnimatedLoader = () => {
    return (
        <Animated.View
            exiting={FadeOut.duration(250)}
            style={[
                StyleSheet.absoluteFillObject,
                {
                    backgroundColor: Colors.primary,
                    zIndex: 1000,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 125,
                },
            ]}
        >
            <Skeleton>
                <View style={{ flex: 1, paddingHorizontal: 15 }}>
                    <View style={{ alignItems: "flex-end" }}>
                        <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                    </View>

                    <View style={{ paddingTop: 65, paddingBottom: 20 }}>
                        <Skeleton.Item width={(w) => w * 0.65} height={65} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w * 0.4} height={15} style={{ marginTop: 10 }} />
                    </View>

                    <View>
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                        <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
                    </View>
                </View>
            </Skeleton>
        </Animated.View>
    )
}

export default AnimatedLoader
