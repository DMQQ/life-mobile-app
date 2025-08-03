import { default as Skeleton, default as SkeletonPlaceholder } from "@/components/SkeletonLoader/Skeleton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StyleSheet, View } from "react-native"
import Animated, { FadeOut } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function LoadingSkeleton() {
    const insets = useSafeAreaInsets()

    return (
        <Animated.View
            exiting={FadeOut.duration(250)}
            style={[
                StyleSheet.absoluteFillObject,
                { top: insets.top, zIndex: 1000, flex: 1, paddingHorizontal: 15, backgroundColor: Colors.primary },
            ]}
        >
            <SkeletonPlaceholder size={(size) => ({ width: size.width - 30, height: size.height })}>
                <View>
                    <View style={{ justifyContent: "flex-end", gap: 10, flexDirection: "row" }}>
                        <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                        <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                    </View>
                    {/* Main Balance */}
                    <SkeletonPlaceholder.Item width={(w) => w - 80} height={50} style={{ marginTop: 80 }} />
                    <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} style={{ marginTop: 10 }} />

                    {/* Weekly Overview */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: Layout.screen.width - 30,
                            marginTop: 40,
                        }}
                    >
                        {new Array(3).fill(0).map((_, index) => (
                            <View key={index} style={{ alignItems: "center", justifyContent: "center" }}>
                                <SkeletonPlaceholder.Item width={(w) => (w - 30) / 3 - 10} height={30} />
                                <SkeletonPlaceholder.Item width={(w) => (w - 30) / 3 - 10} height={10} marginTop={5} />
                            </View>
                        ))}
                    </View>

                    <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={30} />

                    {/* Recent Transactions */}
                    <View style={{ marginTop: 15 }}>
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />

                        <View style={{ flexDirection: "row", gap: 15, marginTop: 5 }}>
                            <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
                            <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
                            <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
                        </View>

                        <View style={{ marginTop: 15 }}>
                            <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />

                            <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} />
                            <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
                            <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
                        </View>
                    </View>

                    {/* For Today Section */}
                    <View style={{ marginTop: 30 }}>
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
                    </View>
                </View>
            </SkeletonPlaceholder>
        </Animated.View>
    )
}
