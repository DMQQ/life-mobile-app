import { Header } from "@/components"
import { Feather } from "@expo/vector-icons"
import { useMemo } from "react"
import Colors from "@/constants/Colors"

interface TimelineCreateHeaderProps {
    selectedDate: string
    handleChangeDate: (date: Date) => void
    submitDisabled?: boolean
    onSubmit?: () => void
}

export default function TimelineCreateHeader(props: TimelineCreateHeaderProps) {
    const buttons = useMemo(
        () => [
            {
                position: "right" as const,
                standalone: true,
                icon: <Feather name="check" size={20} color="#fff" />,
                onPress: props.onSubmit,
                disabled: props.submitDisabled,
                tintColor: Colors.secondary + (props.submitDisabled ? "80" : ""),
            },
        ],
        [props.submitDisabled, props.onSubmit],
    )

    return (
        <Header
            shadow={false}
            backIcon={<Feather name="x" size={20} color="#fff" />}
            goBack
            isScreenModal
            initialHeight={80}
            buttons={buttons}
        />
    )
}
