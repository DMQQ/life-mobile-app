import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons"
import Color from "color"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

const styles = StyleSheet.create({
    container: {
        padding: 15,
        position: "absolute",
        top: 0,
        alignItems: "center",
        width: Layout.screen.width,
        zIndex: 1000,
    },
    processingCard: {
        borderRadius: 20,
        overflow: "hidden",
    },
    glowContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
    },
    content: {},
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 2,
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 11,
    },
    closeButton: {
        padding: 5,
        marginLeft: 5,
    },
    progressContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: Colors.secondary,
    },
    aiConfirmButton: {
        flexDirection: "row",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: Colors.secondary,
        borderRadius: 100,
    },
})

interface FloatingProcessingViewProps {
    visible: boolean
    currentStep: number
    onClose: () => void

    expense?: Expense

    handleRemove?: (id: string) => void

    handleSuccess?: () => void

    handleEdit?: (id: string) => void
}

const steps = [
    { id: "compress", label: "Compressing", icon: "compress" },
    { id: "upload", label: "Uploading", icon: "cloud-upload" },
    { id: "analyze", label: "Analyzing", icon: "brain" },
    { id: "success", label: "Success", icon: "success" },
]

const slideInUpWithScale = () => {
    "worklet"
    const animations = {
        transform: [
            { translateY: withSpring(0, { damping: 20, stiffness: 150 }) },
            { scale: withSpring(1, { damping: 20, stiffness: 150 }) },
        ],
        opacity: withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    }
    const initialValues = {
        transform: [{ translateY: 40 }, { scale: 0.9 }],
        opacity: 0,
    }
    return { initialValues, animations }
}

const slideOutDownWithScale = () => {
    "worklet"
    const animations = {
        transform: [
            { translateY: withTiming(40, { duration: 250, easing: Easing.in(Easing.ease) }) },
            { scale: withTiming(0.9, { duration: 250, easing: Easing.in(Easing.ease) }) },
        ],
        opacity: withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }),
    }
    const initialValues = {
        transform: [{ translateY: 0 }, { scale: 1 }],
        opacity: 1,
    }
    return { initialValues, animations }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function FloatingProcessingView({
    visible,
    currentStep,
    onClose,
    expense,
    handleRemove,
    handleSuccess,
    handleEdit,
}: FloatingProcessingViewProps) {
    const glowAnimation = useSharedValue(0)
    const pulseAnimation = useSharedValue(1)
    const shimmerAnimation = useSharedValue(0)
    const progressAnimation = useSharedValue(0)

    useEffect(() => {
        if (visible) {
            glowAnimation.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
                    withTiming(0, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
                ),
                -1,
                true,
            )

            pulseAnimation.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
                    withTiming(0.95, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
                ),
                -1,
                true,
            )

            shimmerAnimation.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false)

            progressAnimation.value = withTiming((currentStep + 1) / steps.length, {
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
        }
    }, [visible, currentStep])

    const expansionProgress = useSharedValue(0)
    const [showExpense, setShowExpense] = useState(false)

    useEffect(() => {
        expansionProgress.value = withTiming(currentStep === 3 ? 1 : 0, {
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
        })

        if (currentStep === 3) {
            let timeout = setTimeout(() => {
                setShowExpense(true)
            }, 300)

            return () => {
                clearTimeout(timeout)
            }
        } else {
            setShowExpense(false)
        }
    }, [currentStep])

    const animatedHeightStyle = useAnimatedStyle(() => {
        const progress = expansionProgress.value
        return {
            minHeight: interpolate(progress, [0, 1], [60, 180]),
            width: interpolate(progress, [0, 1], [(Layout.screen.width - 30) / 1.4, Layout.screen.width - 30]),
        }
    })

    const glowStyle = useAnimatedStyle(() => {
        const glowIntensity = interpolate(glowAnimation.value, [0, 1], [0.2, 0.6])
        const shadowRadius = interpolate(glowAnimation.value, [0, 1], [8, 20])

        return {
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowIntensity,
            shadowRadius: shadowRadius,
            elevation: 15,
        }
    })

    const pulseStyle = useAnimatedStyle(() => {
        if (currentStep === 3) return {}
        return {
            transform: [{ scale: pulseAnimation.value }],
        }
    }, [currentStep])

    const shimmerStyle = useAnimatedStyle(() => {
        const translateX = interpolate(shimmerAnimation.value, [0, 1], [-Layout.screen.width, Layout.screen.width])

        return {
            transform: [{ translateX }],
        }
    })

    const progressStyle = useAnimatedStyle(() => {
        const width = interpolate(progressAnimation.value, [0, 1], [0, 100])
        return {
            width: `${width}%`,
        }
    })

    const getStepIcon = (step: string) => {
        const iconProps = { size: 20, color: Colors.foreground }

        switch (step) {
            case "compress":
                return <MaterialIcons name="compress" {...iconProps} />
            case "upload":
                return <AntDesign name="cloudupload" {...iconProps} />
            case "analyze":
                return <Ionicons name="analytics" {...iconProps} />
            default:
                return <AntDesign name="camera" {...iconProps} />
        }
    }

    if (!visible) return null

    const currentStepData = steps[currentStep] || { label: "Processing", icon: "camera" }

    return (
        <AnimatedPressable
            style={[pulseStyle, styles.container]}
            entering={slideInUpWithScale}
            exiting={slideOutDownWithScale}
        >
            <Animated.View style={[styles.processingCard, glowStyle]}>
                <Animated.View
                    style={[styles.glowContainer]}
                    entering={FadeIn.delay(100).duration(500)}
                    exiting={FadeOut.duration(200)}
                >
                    <LinearGradient
                        colors={[
                            Color(Colors.secondary).darken(0.5).hex(),
                            Color(Colors.secondary).darken(0.25).hex(),
                            Colors.secondary,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            position: "absolute",
                            top: -2,
                            left: -2,
                            right: -2,
                            bottom: -2,
                            borderRadius: 25,
                        }}
                    />
                </Animated.View>

                <Animated.View
                    pointerEvents="none"
                    style={[styles.glowContainer]}
                    entering={FadeIn.delay(300).duration(600)}
                    exiting={FadeOut.duration(150)}
                >
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.2,
                            },
                            shimmerStyle,
                        ]}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255, 255, 255, 0.15)", "transparent"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                width: 100,
                                height: "100%",
                            }}
                        />
                    </Animated.View>
                </Animated.View>

                <BlurView
                    intensity={60}
                    style={[
                        {
                            backgroundColor: "rgba(0, 0, 0, 0.2)",
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            {
                                borderRadius: 20,
                                padding: 10,
                            },
                            animatedHeightStyle,
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    {
                                        backgroundColor: Color(Colors.secondary).alpha(0.15).hex(),
                                        borderWidth: 1,
                                        borderColor: Color(Colors.secondary).alpha(0.2).hex(),
                                    },
                                ]}
                            >
                                {getStepIcon(currentStepData.icon)}
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.title}>AI Processing</Text>
                                <Text style={styles.subtitle}>{currentStepData.label}...</Text>
                            </View>

                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <AntDesign name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
                            </Pressable>
                        </View>
                        {showExpense && (
                            <Animated.View entering={FadeIn}>
                                <Animated.ScrollView
                                    keyboardDismissMode={"on-drag"}
                                    style={{
                                        maxHeight: Layout.window.height / 2,
                                        flex: 1,
                                        paddingVertical: 10,
                                        paddingBottom: 5,
                                    }}
                                >
                                    <WalletItem
                                        {...(expense as any)}
                                        animatedStyle={{
                                            marginBottom: 0,
                                            marginTop: 5,
                                        }}
                                    />
                                </Animated.ScrollView>
                                <View
                                    style={{
                                        paddingTop: 10,
                                        justifyContent: "flex-end",
                                        width: "100%",
                                        flexDirection: "row",
                                        gap: 10,
                                    }}
                                >
                                    <Ripple
                                        style={[styles.aiConfirmButton, { backgroundColor: Colors.error }]}
                                        onPress={() => {
                                            handleRemove?.(expense?.id || "")
                                        }}
                                    >
                                        <AntDesign name="closecircle" size={18} color="rgba(255,255,255,0.8)" />
                                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>Cancel</Text>
                                    </Ripple>
                                    <Ripple
                                        style={[styles.aiConfirmButton, { backgroundColor: Colors.warning }]}
                                        onPress={() => {
                                            handleEdit?.(expense?.id || "")
                                        }}
                                    >
                                        <AntDesign name="edit" size={18} color="rgba(255,255,255,0.8)" />
                                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>Edit</Text>
                                    </Ripple>

                                    <Ripple
                                        style={styles.aiConfirmButton}
                                        onPress={() => {
                                            handleSuccess?.()
                                        }}
                                    >
                                        <AntDesign name="checkcircle" size={18} color="rgba(255,255,255,0.8)" />
                                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>All good!</Text>
                                    </Ripple>
                                </View>
                            </Animated.View>
                        )}
                    </Animated.View>
                </BlurView>

                {currentStep < 3 && (
                    <View style={styles.progressContainer}>
                        <Animated.View style={[styles.progressFill, progressStyle]} />
                    </View>
                )}
            </Animated.View>
        </AnimatedPressable>
    )
}

import { IconButton } from "@/components"
import { Expense } from "@/types"
import { gql, useApolloClient, useMutation } from "@apollo/client"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import Ripple from "react-native-material-ripple"
import useDeleteActivity from "../../hooks/useDeleteActivity"
import WalletItem from "../Wallet/WalletItem"

export default function ExpenseAIMaker({
    initialOpen,
    setExpense,
}: {
    initialOpen?: boolean
    setExpense?: (expense: Expense) => void
}) {
    const navigation = useNavigation<any>()
    const [processingStep, setProcessingStep] = useState(-1)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [timeoutId])

    useEffect(() => {
        if (initialOpen) {
            handleImagePick()
        }
    }, [initialOpen])

    const [aiPhotoPrediction, state] = useMutation(
        gql`
            mutation AiPhotoPrediction($image: String!) {
                createExpenseFromImage(image: $image) {
                    id
                    amount
                    date
                    description
                    type
                    category
                    balanceBeforeInteraction
                    note
                    spontaneousRate
                    subexpenses {
                        id
                        description
                        amount
                        category
                    }
                }
            }
        `,
        {
            onError: () => {
                setProcessingStep(-1)
            },
        },
    )

    const handleClose = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeoutId(null)
        }
        setProcessingStep(-1)
        navigation.goBack()
    }

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()

        if (status !== "granted") {
            Alert.alert("Camera Permission Required", "Please allow camera access to take photos of your expenses.", [
                { text: "OK" },
            ])
            return
        }

        const result = await (__DEV__
            ? ImagePicker.launchImageLibraryAsync({
                  mediaTypes: "images",
                  allowsEditing: true,
                  quality: 1,
                  base64: true,
                  aspect: [9, 16],
              })
            : ImagePicker.launchCameraAsync({
                  mediaTypes: "images",
                  allowsEditing: true,
                  quality: 1,
                  base64: true,
                  cameraType: ImagePicker.CameraType.back,
                  aspect: [9, 16],
              }))

        if (!result.canceled && result.assets?.[0]?.base64) {
            const asset = result.assets[0]
            const dataUrl = `data:${asset.mimeType};base64,${asset.base64}`

            setProcessingStep(0)
            setTimeout(() => setProcessingStep(1), 800)
            setTimeout(() => setProcessingStep(2), 1600)

            await aiPhotoPrediction({ variables: { image: dataUrl } })

            setProcessingStep(3)
        }
    }

    const { deleteActivity } = useDeleteActivity()

    const handleRemovePredicted = async (id: string) => {
        await deleteActivity({
            variables: {
                id,
            },
        })

        setProcessingStep(-1)
    }

    const client = useApolloClient()

    return (
        <>
            <IconButton
                onPress={handleImagePick}
                style={{ position: "absolute", top: 15, right: 15, zIndex: 100 }}
                icon={<AntDesign name="camerao" size={24} color="rgba(255,255,255,0.7)" />}
            />

            <FloatingProcessingView
                visible={processingStep >= 0}
                currentStep={processingStep}
                onClose={handleClose}
                expense={state.data?.createExpenseFromImage}
                handleRemove={handleRemovePredicted}
                handleSuccess={async () => {
                    await client?.refetchQueries({
                        include: ["GetWallet", "Limits"],
                    })
                    navigation.replace("Expense", {
                        expense: state.data?.createExpenseFromImage as Expense,
                    })
                }}
                handleEdit={(id: string) => {
                    handleRemovePredicted(id)
                    setExpense?.(state.data?.createExpenseFromImage as Expense)
                }}
            />
        </>
    )
}
