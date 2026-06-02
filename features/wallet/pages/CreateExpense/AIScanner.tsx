import { FONTS } from "@/constants/Fonts"
import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Feather } from "@expo/vector-icons"
import { gql, useApolloClient, useMutation } from "@apollo/client"
import * as ImagePicker from "expo-image-picker"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import Feedback from "react-native-haptic-feedback"
import { useNavigation } from "@react-navigation/native"
import { useCreateExpenseContext } from "../../context/CreateExpenseContext"
import useDeleteActivity from "../../hooks/useDeleteActivity"
import { Expense } from "@/types"
import PermissionView from "./components/PermissionView"
import ProcessingOverlay from "./components/ProcessingOverlay"
import ResultPanel from "./components/ResultPanel"

const AI_MUTATION = gql`
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
`

const CAMERA_H = Layout.screen.height * (3 / 4)
const CAMERA_H_RESULT = Layout.screen.height * 0.38

type ScanState = "idle" | "processing" | "result"

export default function AIScanner() {
    const [permission, requestPermission] = useCameraPermissions()
    const cameraRef = useRef<CameraView>(null)

    const navigation = useNavigation<any>()
    const { methods } = useCreateExpenseContext()
    const { deleteActivity } = useDeleteActivity()
    const client = useApolloClient()

    const [scanState, setScanState] = useState<ScanState>("idle")
    const [step, setStep] = useState(0)
    const [scannedExpense, setScannedExpense] = useState<Expense | null>(null)

    const cameraHeight = useSharedValue(CAMERA_H)
    const cameraStyle = useAnimatedStyle(() => ({ height: cameraHeight.value }))

    useEffect(() => {
        cameraHeight.value = withTiming(scanState === "result" ? CAMERA_H_RESULT : CAMERA_H)
    }, [scanState])

    const [aiScan] = useMutation(AI_MUTATION, {
        onError: () => {
            setScanState("idle")
            setStep(0)
        },
    })

    const processImage = async (base64: string, mimeType = "image/jpeg") => {
        setScanState("processing")
        setStep(0)
        const t1 = setTimeout(() => setStep(1), 1000)
        const t2 = setTimeout(() => setStep(2), 2200)

        const { data } = await aiScan({
            variables: { image: `data:${mimeType};base64,${base64}` },
        })

        clearTimeout(t1)
        clearTimeout(t2)

        if (data?.createExpenseFromImage) {
            setScannedExpense(data.createExpenseFromImage)
            setScanState("result")
        } else {
            setScanState("idle")
        }
    }

    const takePhoto = async () => {
        if (!cameraRef.current) return
        Feedback.trigger("impactMedium")
        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 })
            if (!photo?.base64) return
            cameraRef.current.pausePreview()
            await processImage(photo.base64)
        } catch {
            setScanState("idle")
        }
    }

    const pickFromGallery = async () => {
        Feedback.trigger("impactLight")
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        })
        if (result.canceled || !result.assets?.[0]?.base64) return
        const asset = result.assets[0]
        await processImage(asset.base64!, asset.mimeType || "image/jpeg")
    }

    const handleFillForm = async () => {
        if (!scannedExpense) return
        Feedback.trigger("impactMedium")
        await deleteActivity({ variables: { id: scannedExpense.id } })
        methods.setExpense(scannedExpense)
        navigation.goBack()
    }

    const handleSaveAndView = async () => {
        if (!scannedExpense) return
        Feedback.trigger("impactMedium")
        await client.refetchQueries({ include: ["GetWallet", "Limits"] })
        navigation.replace("Expense", { expense: scannedExpense })
    }

    const handleDiscard = async () => {
        Feedback.trigger("impactLight")
        if (scannedExpense) await deleteActivity({ variables: { id: scannedExpense.id } })
        cameraRef.current?.resumePreview()
        setScanState("idle")
        setScannedExpense(null)
    }

    return (
        <View style={styles.root}>
            <Animated.View style={[styles.cameraContainer, cameraStyle]}>
                {permission?.granted ? (
                    <CameraView ref={cameraRef} style={styles.camera} facing="back" />
                ) : (
                    <PermissionView onRequest={requestPermission} />
                )}

                {scanState === "processing" && <ProcessingOverlay step={step} />}
            </Animated.View>

            {scanState === "idle" && (
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.actionRow}>
                    <View style={{ flexDirection: "row", gap: 10, width: "70%" }}>
                        <Pressable onPress={takePhoto} hitSlop={8} style={styles.actionFlex}>
                            <GlassView style={styles.actionBtnPrimary}>
                                <Feather name="camera" size={16} color={Colors.foreground} />
                                <Text style={styles.actionBtnPrimaryLabel}>Take photo</Text>
                            </GlassView>
                        </Pressable>
                        <Pressable onPress={pickFromGallery} hitSlop={8} style={styles.actionFlex}>
                            <GlassView style={styles.actionBtnPrimary}>
                                <Feather name="image" size={16} color={Colors.foreground_secondary} />
                                <Text style={styles.actionBtnPrimaryLabel}>Gallery</Text>
                            </GlassView>
                        </Pressable>
                    </View>
                </Animated.View>
            )}

            {scanState === "result" && scannedExpense && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.resultWrapper}>
                    <ResultPanel
                        expense={scannedExpense}
                        onFillForm={handleFillForm}
                        onSaveAndView={handleSaveAndView}
                        onDiscard={handleDiscard}
                    />
                </Animated.View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingTop: 80,
        paddingBottom: 15,
        gap: 12,
    },
    cameraContainer: {
        borderRadius: 25,
        overflow: "hidden",
        backgroundColor: Colors.primary_light,
    },
    camera: {
        flex: 1,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
    },
    actionFlex: {
        flex: 1,
    },
    actionBtnPrimary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 100,
    },
    actionBtnPrimaryLabel: {
        color: Colors.foreground,
        fontSize: 15,
        fontFamily: FONTS.semibold,
    },
    actionBtnSecondary: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 100,
    },
    actionBtnSecondaryLabel: {
        color: Colors.foreground_secondary,
        fontSize: 15,
        fontFamily: FONTS.medium,
    },
    resultWrapper: {
        flex: 1,
    },
})
