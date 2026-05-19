import { ModalHeader } from "@/components"
import { Feather } from "@expo/vector-icons"
import { useMemo } from "react"
import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"

interface TimelineCreateHeaderProps {
    selectedDate: string
    handleChangeDate: (date: Date) => void
    submitDisabled?: boolean
    onSubmit?: () => void
    dirty?: boolean
}

export default function TimelineCreateHeader(props: TimelineCreateHeaderProps) {
    const navigation = useNavigation()

    return (
        <ModalHeader
            dirty={props.dirty}
            onClose={navigation.goBack}
            onSave={props.onSubmit}
            title="Create event"
            saveDisabled={props.submitDisabled}
            saveIcon="checkmark"
        />
    )
}
