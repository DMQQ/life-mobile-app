import Colors from "@/constants/Colors"
import BottomSheetGorhom, { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet"
import { BlurView } from "expo-blur"
import { ReactNode, forwardRef, useCallback } from "react"
import { View } from "react-native"

const BottomSheet = forwardRef<
    Omit<BottomSheetGorhom, "snapPoints">,
    {
        snapPoints: (string | number)[]
        children: ReactNode
        onChange?: (index: number) => void
        blurIntensity?: number
        blurTint?: "light" | "dark" | "default"
        showBlur?: boolean
    } & Partial<BottomSheetGorhom>
>((props, ref) => {
    const { blurIntensity = 60, blurTint = "dark", showBlur = false, ...bottomSheetProps } = props

    const backdropComponent = useCallback(
        (backdropProps: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} {...backdropProps} />
        ),
        [],
    )

    const CustomBackground = useCallback(
        ({ style }: any) => {
            const baseStyle = [
                style,
                {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                },
            ]

            if (showBlur) {
                return <BlurView style={baseStyle} intensity={blurIntensity} tint={blurTint} />
            }

            return <View style={[...baseStyle, { backgroundColor: Colors.primary }]} />
        },
        [showBlur, blurIntensity, blurTint],
    )

    return (
        <BottomSheetGorhom
            index={-1}
            keyboardBlurBehavior="restore"
            {...bottomSheetProps}
            backdropComponent={backdropComponent}
            backgroundComponent={CustomBackground}
            snapPoints={props.snapPoints}
            ref={ref}
            onChange={(index) => {
                props.onChange?.(index)
            }}
            handleIndicatorStyle={{
                backgroundColor: Colors.secondary,
                margin: 5,
                width: 40,
                height: 4,
                borderRadius: 2,
            }}
            enablePanDownToClose
            containerStyle={{
                zIndex: 1000,
            }}
        >
            {props.children}
        </BottomSheetGorhom>
    )
})

export { BottomSheetGorhom }
export default BottomSheet
