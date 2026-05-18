import { useNavigation } from "@react-navigation/native"
import { NativeStackHeaderItem } from "@react-navigation/native-stack"
import { Button, Host, Menu, Section } from "@expo/ui/swift-ui"
import { buttonStyle } from "@expo/ui/swift-ui/modifiers"
import { SFSymbol, SymbolView } from "expo-symbols"
import { useLayoutEffect } from "react"
import Haptic from "react-native-haptic-feedback"

interface ModalHeaderProps {
    onClose?: () => void
    closeIcon?: SFSymbol
    onSave?: () => void
    saveLabel?: string
    saveIcon?: SFSymbol
    saveDisabled?: boolean
    saveLoading?: boolean
    title?: string
    padTop?: boolean
    dirty?: boolean
}

function ConfirmCloseButton({ onConfirm, closeIcon }: { onConfirm: () => void; closeIcon: SFSymbol }) {
    return (
        <Host matchContents>
            <Menu label={<SymbolView name={closeIcon} size={20} tintColor={"#fff"} weight="regular" />}>
                <Section title="You have unsaved changes. Are you sure you want to discard them?">
                    <Button
                        role="destructive"
                        label="Discard Changes"
                        onPress={() => {
                            onConfirm()
                            Haptic.trigger("impactMedium")
                        }}
                        modifiers={[buttonStyle("bordered")]}
                    />
                </Section>
            </Menu>
        </Host>
    )
}

export default function ModalHeader({
    onClose,
    closeIcon = "xmark",
    onSave,
    saveLabel = "Save",
    saveIcon,
    saveDisabled = false,
    saveLoading = false,
    title,
    dirty = false,
}: ModalHeaderProps) {
    const navigation = useNavigation()

    useLayoutEffect(() => {
        const leftItems: NativeStackHeaderItem[] = []
        const rightItems: NativeStackHeaderItem[] = []

        if (onClose) {
            if (dirty) {
                leftItems.push({
                    type: "custom",
                    element: <ConfirmCloseButton onConfirm={onClose} closeIcon={closeIcon} />,
                })
            } else {
                leftItems.push({
                    type: "button",
                    label: "",
                    icon: { type: "sfSymbol", name: closeIcon },
                    onPress: () => {
                        Haptic.trigger("impactLight")
                        onClose()
                    },
                })
            }
        }

        if (onSave) {
            rightItems.push({
                type: "button",
                label: saveLoading ? "Loading..." : saveLabel,
                icon: saveIcon ? { type: "sfSymbol", name: saveIcon } : undefined,
                variant: "done",
                disabled: saveDisabled || saveLoading,
                onPress: () => {
                    Haptic.trigger("impactLight")
                    onSave()
                },
            })
        }

        navigation.setOptions({
            headerBackVisible: false,
            headerShadowVisible: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            title: title ?? "",
            unstable_headerLeftItems: leftItems.length > 0 ? () => leftItems : undefined,
            unstable_headerRightItems: rightItems.length > 0 ? () => rightItems : undefined,
        })
    }, [onClose, closeIcon, onSave, saveLabel, saveIcon, saveDisabled, saveLoading, title, navigation, dirty])

    return null
}
