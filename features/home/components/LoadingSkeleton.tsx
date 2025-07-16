import SkeletonPlaceholder from "@/components/SkeletonLoader/Skeleton"
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
                { top: insets.top, zIndex: 1000, flex: 1, padding: 15, backgroundColor: Colors.primary },
            ]}
        >
            <SkeletonPlaceholder size={(size) => size}>
                <View>
                    {/* Main Balance */}
                    <SkeletonPlaceholder.Item width={(w) => w - 30} height={35} />

                    {/* Weekly Overview */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: Layout.screen.width - 30,
                            marginTop: 15,
                        }}
                    >
                        <SkeletonPlaceholder.Item width={(w) => (w - 30) / 2} height={50} />
                        <SkeletonPlaceholder.Item width={(w) => (w - 30) / 3.5} height={30} />
                    </View>

                    <View style={{ marginTop: 12.5 }}>
                        <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={20} />
                        <SkeletonPlaceholder.Item width={(w) => w - 30} height={15} />
                    </View>

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