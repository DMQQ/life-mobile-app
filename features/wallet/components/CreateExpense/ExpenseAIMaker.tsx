import { IconButton } from "@/components"
import { Expense } from "@/types"
import { gql, useApolloClient, useMutation } from "@apollo/client"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { useEffect, useState } from "react"
import useDeleteActivity from "../../hooks/useDeleteActivity"
import GlassView from "@/components/ui/GlassView"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import { FloatingProcessingView } from "./FloatingProcessingView"

export default function ExpenseAIMaker({ initialOpen }: { initialOpen?: boolean }) {
    const { methods } = useCreateExpenseContext()
    const setExpense = methods.setExpense
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

        if (status !== "granted") return

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
            <GlassView
                style={{
                    padding: 10,
                    borderRadius: 100,
                    width: 55,
                    height: 55,

                    justifyContent: "center",
                }}
            >
                <IconButton
                    onPress={handleImagePick}
                    icon={<AntDesign name="camera" size={20} color="rgba(255,255,255,0.7)" />}
                />
            </GlassView>

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
                    setExpense(state.data?.createExpenseFromImage as Expense)
                }}
            />
        </>
    )
}
