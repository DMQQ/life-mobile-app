import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { gql, useApolloClient, useMutation } from "@apollo/client"
import Color from "color"
import * as ImagePicker from "expo-image-picker"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native"
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import Feedback from "react-native-haptic-feedback"
import { useNavigation } from "@react-navigation/native"
import { useCreateExpenseContext } from "../../context/CreateExpenseContext"
import useDeleteActivity from "../../hooks/useDeleteActivity"
import { CategoryIcon, CategoryUtils } from "../../components/Expense/ExpenseIcon"
import { Expense } from "@/types"
import Layout from "@/constants/Layout"

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

const STEPS = [
    { label: "Uploading receipt", icon: "upload-cloud" as const },
    { label: "Analyzing content", icon: "eye" as const },
    { label: "Extracting data", icon: "cpu" as const },
]

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

function PermissionView({ onRequest }: { onRequest: () => void }) {
    return (
        <View style={styles.permissionView}>
            <GlassView style={styles.permissionIcon}>
                <Feather name="camera-off" size={28} color={Colors.foreground_secondary} />
            </GlassView>
            <Text variant="body" style={styles.permissionText}>
                Camera access required
            </Text>
            <Pressable onPress={onRequest}>
                <GlassView style={styles.permissionBtn}>
                    <Text style={styles.permissionBtnLabel}>Allow camera</Text>
                </GlassView>
            </Pressable>
        </View>
    )
}

function ProcessingOverlay({ step }: { step: number }) {
    const glowOpacity = useSharedValue(0.15)

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.45, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.15, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
        )
    }, [])

    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }))

    return (
        <View style={styles.processingOverlay}>
            <Animated.View style={[styles.processingBorder, glowStyle]} />

            <View style={[styles.bracket, styles.bracketTL]} />
            <View style={[styles.bracket, styles.bracketTR]} />
            <View style={[styles.bracket, styles.bracketBL]} />
            <View style={[styles.bracket, styles.bracketBR]} />

            <View style={styles.processingBottom}>
                <GlassView style={styles.processingIndicator}>
                    <ActivityIndicator color={Colors.secondary} size="small" />
                    <Text style={styles.processingLabel}>Analyzing receipt...</Text>
                </GlassView>

                <View style={styles.steps}>
                    {STEPS.map((s, i) => {
                        const done = i < step
                        const active = i === step
                        return (
                            <Animated.View
                                key={s.label}
                                entering={FadeIn.delay(i * 200)}
                                style={[styles.stepRow, active && styles.stepRowActive]}
                            >
                                <View
                                    style={[
                                        styles.stepIcon,
                                        done && styles.stepIconDone,
                                        active && styles.stepIconActive,
                                    ]}
                                >
                                    {done ? (
                                        <Feather name="check" size={12} color={Colors.secondary} />
                                    ) : (
                                        <Feather
                                            name={s.icon}
                                            size={12}
                                            color={active ? Colors.secondary : Colors.foreground_disabled}
                                        />
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.stepLabel,
                                        active && styles.stepLabelActive,
                                        done && styles.stepLabelDone,
                                    ]}
                                >
                                    {s.label}
                                </Text>
                            </Animated.View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

function ResultPanel({
    expense,
    onFillForm,
    onSaveAndView,
    onDiscard,
}: {
    expense: Expense
    onFillForm: () => void
    onSaveAndView: () => void
    onDiscard: () => void
}) {
    const isIncome = expense.type === "income"
    const amountColor = isIncome ? "#66E875" : "#F07070"
    const sign = isIncome ? "+" : "-"

    return (
        <View style={styles.resultCard}>
            <View style={styles.resultBadgeRow}>
                <View
                    style={[
                        styles.typeBadge,
                        {
                            backgroundColor: Color(amountColor).alpha(0.12).string(),
                            borderColor: Color(amountColor).alpha(0.28).string(),
                        },
                    ]}
                >
                    <View style={[styles.typeDot, { backgroundColor: amountColor }]} />
                    <Text style={[styles.typeBadgeLabel, { color: amountColor }]}>
                        {isIncome ? "Income" : "Expense"}
                    </Text>
                </View>
                <View style={styles.aiBadge}>
                    <Feather name="cpu" size={10} color={Colors.secondary} />
                    <Text style={styles.aiBadgeLabel}>AI detected</Text>
                </View>
            </View>

            <View style={styles.resultHero}>
                <Text style={[styles.resultAmount, { color: "#fff" }]}>
                    {sign}
                    {Math.abs(expense.amount).toFixed(2)}zł
                </Text>
                <Text style={styles.resultDescription} numberOfLines={2}>
                    {expense.description}
                </Text>
            </View>

            {(expense.category || expense.note) && (
                <View style={styles.resultMeta}>
                    {expense.category ? (
                        <View style={styles.metaChip}>
                            <CategoryIcon
                                category={expense.category as any}
                                type={expense.type as any}
                                size={11}
                                clear
                                style={{ padding: 0 }}
                                containerStyle={{ width: 18, height: 18, borderRadius: 5 }}
                            />
                            <Text style={styles.metaChipAccent}>
                                {CategoryUtils.getCategoryName(expense.category)}
                            </Text>
                        </View>
                    ) : null}
                    {expense.note ? (
                        <View style={styles.metaChip}>
                            <Feather name="file-text" size={10} color={Colors.foreground_secondary} />
                            <Text style={styles.metaChipText} numberOfLines={1}>
                                {expense.note}
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}

            {expense.subexpenses && expense.subexpenses.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subexpensesRow}
                >
                    {expense.subexpenses.map((sub) => (
                        <View key={sub.id} style={styles.subexpenseChip}>
                            {sub.category ? (
                                <CategoryIcon
                                    category={sub.category as any}
                                    type="expense"
                                    size={10}
                                    clear
                                    style={{ padding: 0 }}
                                    containerStyle={{ width: 16, height: 16, borderRadius: 4 }}
                                />
                            ) : null}
                            <Text style={styles.subexpenseDesc} numberOfLines={1}>
                                {sub.description}
                            </Text>
                            <Text style={styles.subexpenseAmount}>{Math.abs(sub.amount).toFixed(2)}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            <View style={styles.divider} />

            <View style={styles.resultActions}>
                <Pressable onPress={onFillForm} style={styles.fillFormBtn} hitSlop={6}>
                    <GlassView style={styles.fillFormInner}>
                        <Feather name="edit-3" size={15} color={Colors.secondary} />
                        <Text style={styles.fillFormLabel}>Fill form</Text>
                    </GlassView>
                </Pressable>

                <View style={styles.secondaryActions}>
                    <Pressable onPress={onSaveAndView} style={styles.actionFlex} hitSlop={6}>
                        <GlassView style={styles.secondaryBtn}>
                            <Feather name="check" size={14} color={Colors.foreground} />
                            <Text style={styles.secondaryBtnLabel}>Save</Text>
                        </GlassView>
                    </Pressable>
                    <Pressable onPress={onDiscard} style={styles.actionFlex} hitSlop={6}>
                        <GlassView style={styles.secondaryBtn}>
                            <Feather name="trash-2" size={14} color={Colors.foreground_secondary} />
                            <Text style={styles.discardLabel}>Discard</Text>
                        </GlassView>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const BRACKET = 22
const BRACKET_W = 2.5

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingTop: 80,
        paddingBottom: 15,
        gap: 12,
    },

    // Camera
    cameraContainer: {
        borderRadius: 25,
        overflow: "hidden",
        backgroundColor: Colors.primary_light,
    },
    camera: {
        flex: 1,
    },

    // Permission
    permissionView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
    },
    permissionIcon: {
        width: 64,
        height: 64,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionText: {
        color: Colors.foreground_secondary,
    },
    permissionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 100,
    },
    permissionBtnLabel: {
        color: Colors.secondary,
        fontSize: 15,
        fontWeight: "600",
    },

    // Processing overlay
    processingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Color(Colors.primary).alpha(0.72).string(),
    },
    processingBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    bracket: {
        position: "absolute",
        width: BRACKET,
        height: BRACKET,
        borderColor: Colors.secondary,
    },
    bracketTL: {
        top: 16,
        left: 16,
        borderTopWidth: BRACKET_W,
        borderLeftWidth: BRACKET_W,
        borderTopLeftRadius: 6,
    },
    bracketTR: {
        top: 16,
        right: 16,
        borderTopWidth: BRACKET_W,
        borderRightWidth: BRACKET_W,
        borderTopRightRadius: 6,
    },
    bracketBL: {
        bottom: 16,
        left: 16,
        borderBottomWidth: BRACKET_W,
        borderLeftWidth: BRACKET_W,
        borderBottomLeftRadius: 6,
    },
    bracketBR: {
        bottom: 16,
        right: 16,
        borderBottomWidth: BRACKET_W,
        borderRightWidth: BRACKET_W,
        borderBottomRightRadius: 6,
    },
    processingBottom: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        gap: 10,
    },
    processingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        alignSelf: "center",
    },
    processingLabel: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "600",
    },
    steps: {
        gap: 6,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        opacity: 0.45,
    },
    stepRowActive: {
        opacity: 1,
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.22).string(),
    },
    stepIcon: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.9).string(),
        justifyContent: "center",
        alignItems: "center",
    },
    stepIconActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
    },
    stepIconDone: {
        backgroundColor: Color(Colors.secondary).alpha(0.12).string(),
    },
    stepLabel: {
        fontSize: 13,
        color: Colors.foreground_disabled,
        fontWeight: "500",
    },
    stepLabelActive: {
        color: Colors.foreground,
    },
    stepLabelDone: {
        color: Colors.foreground_secondary,
    },

    // Action buttons row (idle)
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
        fontWeight: "600",
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
        fontWeight: "500",
    },

    // Result panel
    resultWrapper: {
        flex: 1,
    },
    resultCard: {
        flex: 1,
        backgroundColor: Colors.primary_light,
        borderRadius: 25,
        padding: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).alpha(0.8).string(),
    },
    resultBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        borderWidth: 1,
    },
    typeDot: {
        width: 6,
        height: 6,
        borderRadius: 100,
    },
    typeBadgeLabel: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    aiBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        backgroundColor: Color(Colors.secondary).alpha(0.08).string(),
    },
    aiBadgeLabel: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    resultHero: {
        gap: 6,
    },
    resultAmount: {
        fontSize: 44,
        fontWeight: "800",
        letterSpacing: -2,
    },
    resultDescription: {
        color: Colors.foreground,
        fontSize: 17,
        fontWeight: "600",
        lineHeight: 23,
    },
    resultMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    metaChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 100,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.7).string(),
    },
    metaChipAccent: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    metaChipText: {
        color: Colors.foreground_secondary,
        fontSize: 12,
    },
    subexpensesRow: {
        gap: 6,
        flexDirection: "row",
    },
    subexpenseChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.7).string(),
        maxWidth: 180,
    },
    subexpenseDesc: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        flexShrink: 1,
    },
    subexpenseAmount: {
        color: Colors.foreground,
        fontSize: 12,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.6).string(),
        marginVertical: 2,
    },
    resultActions: {
        gap: 8,
        marginTop: "auto" as any,
    },
    fillFormBtn: {
        borderRadius: 16,
        overflow: "hidden",
    },
    fillFormInner: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        borderRadius: 16,
    },
    fillFormLabel: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: "700",
    },
    secondaryActions: {
        flexDirection: "row",
        gap: 8,
    },
    secondaryBtn: {
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 14,
    },
    secondaryBtnLabel: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "600",
    },
    discardLabel: {
        color: Colors.foreground_secondary,
        fontSize: 14,
        fontWeight: "500",
    },
})
