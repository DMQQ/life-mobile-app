import { Host, Popover, DatePicker as SwiftDatePicker, VStack, RNHostView } from "@expo/ui/swift-ui"
import { datePickerStyle, frame, padding } from "@expo/ui/swift-ui/modifiers"
import Colors from "@/constants/Colors"
import moment from "moment"
import { Pressable, Text } from "react-native"
import GlassView from "@/components/ui/GlassView"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"

interface TimePickerProps {
    value: string
    onChange: (time: string) => void
    label?: string
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [show, setShow] = useState(false)

    const title = label ? `${label}  ${value}` : value
    const buttonWidth = Math.max(Math.ceil(title.length * 11) + 50, 100)

    const selection = moment(value, "HH:mm").toDate()

    return (
        <Host matchContents>
            <Popover isPresented={show} onIsPresentedChange={setShow}>
                <Popover.Trigger>
                    <RNHostView style={{ height: 44, width: buttonWidth }}>
                        <GlassView style={{ flex: 1, borderRadius: 100 }}>
                            <Pressable
                                onPress={() => setShow((p) => !p)}
                                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 15, gap: 6 }}
                            >
                                <Ionicons name="time-outline" size={14} color={Colors.foreground} />
                                <Text style={{ color: Colors.foreground, fontSize: 17, fontWeight: "600" }}>{title}</Text>
                            </Pressable>
                        </GlassView>
                    </RNHostView>
                </Popover.Trigger>
                <Popover.Content>
                    <VStack modifiers={[frame({ width: 200 }), padding({ all: 5 })]}>
                        <SwiftDatePicker
                            selection={selection}
                            displayedComponents={["hourAndMinute"]}
                            onDateChange={(d) => onChange(moment(d).format("HH:mm"))}
                            modifiers={[datePickerStyle("wheel")]}
                        />
                    </VStack>
                </Popover.Content>
            </Popover>
        </Host>
    )
}
