import {
    Host,
    Popover,
    DatePicker as SwiftDatePicker,
    VStack,
    HStack,
    RNHostView,
    Button as SwiftButton,
    Spacer,
    ScrollView as SwiftScrollView,
} from "@expo/ui/swift-ui"
import { datePickerStyle, frame, padding, bold, scrollTargetBehavior } from "@expo/ui/swift-ui/modifiers"
import Colors from "@/constants/Colors"
import moment from "moment"
import { ReactElement, useState } from "react"
import { Pressable, Text, View } from "react-native"
import GlassView from "@/components/ui/GlassView"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"

export interface DatePickerRef {
    open: () => void
    close: () => void
}

interface DatePickerProps {
    dates: {
        start: Date
        end: Date
    }
    setDates: (dates: { start: Date; end: Date }) => void
    mode?: "single" | "period"
    placeholder?: string
    buttonComponent?: (prop: { start: Date; end: Date; onPress: () => void }) => ReactElement
    iconButton?: boolean
    controlRef?: React.MutableRefObject<DatePickerRef | null>

    clear?: boolean
}

export default function DatePicker({
    dates,
    setDates,
    mode = "period",
    placeholder,
    buttonComponent,
    iconButton,
    controlRef,
    clear = false,
}: DatePickerProps) {
    const [show, setShow] = useState(false)
    const [pendingStart, setPendingStart] = useState<Date>(dates.start)
    const [pendingEnd, setPendingEnd] = useState<Date>(dates.end)

    if (controlRef) {
        controlRef.current = {
            open: () => setShow(true),
            close: () => setShow(false),
        }
    }

    const title = (() => {
        if (placeholder) return placeholder
        if (mode === "single") return moment(dates.start).format("DD MMMM")
        if (moment(dates.start).isSame(dates.end, "day")) return moment(dates.start).format("DD MMMM")
        return `${moment(dates.start).format("DD.MM")} – ${moment(dates.end).format("DD.MM")}`
    })()

    const buttonWidth = Math.max(Math.ceil(title.length * 11) + 50, 100)

    const Wrapper = clear ? View : GlassView

    const triggerContent = iconButton ? (
        <RNHostView matchContents>
            <Pressable
                onPress={() => setShow((p) => !p)}
                style={{ width: 35, height: 35, alignItems: "center", justifyContent: "center" }}
            >
                <MaterialIcons name="date-range" size={20} color={Colors.foreground} />
            </Pressable>
        </RNHostView>
    ) : buttonComponent ? (
        <RNHostView matchContents>
            {buttonComponent({ start: dates.start, end: dates.end, onPress: () => setShow((p) => !p) })}
        </RNHostView>
    ) : (
        <RNHostView matchContents>
            <Wrapper style={{ height: 50, width: buttonWidth, borderRadius: 100 }}>
                <Pressable
                    onPress={() => setShow((p) => !p)}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 15,
                        gap: 6,
                    }}
                >
                    <Text style={{ color: Colors.foreground, fontSize: 17, fontWeight: "600" }}>{title}</Text>
                    <AntDesign name="down" size={10} color={Colors.foreground} />
                </Pressable>
            </Wrapper>
        </RNHostView>
    )

    if (mode === "single") {
        return (
            <Host matchContents>
                <Popover isPresented={show} onIsPresentedChange={setShow}>
                    <Popover.Trigger>{triggerContent}</Popover.Trigger>
                    <Popover.Content>
                        <VStack modifiers={[frame({ width: 285 }), padding({ all: 5 })]}>
                            <SwiftDatePicker
                                selection={dates.start}
                                onDateChange={(d) => {
                                    setDates({ start: d, end: d })
                                    setShow(false)
                                }}
                                modifiers={[datePickerStyle("graphical"), frame({ width: 270 })]}
                            />
                        </VStack>
                    </Popover.Content>
                </Popover>
            </Host>
        )
    }

    return (
        <Host matchContents>
            <Popover
                isPresented={show}
                onIsPresentedChange={(v) => {
                    if (!v) {
                        setPendingStart(dates.start)
                        setPendingEnd(dates.end)
                    }
                    setShow(v)
                }}
            >
                <Popover.Trigger>{triggerContent}</Popover.Trigger>
                <Popover.Content>
                    <VStack modifiers={[frame({ width: 300 }), padding({ all: 10 })]}>
                        <SwiftScrollView
                            axes="horizontal"
                            showsIndicators={false}
                            modifiers={[frame({ width: 280 }), scrollTargetBehavior("paging")]}
                        >
                            <HStack>
                                <SwiftDatePicker
                                    selection={pendingStart}
                                    onDateChange={(d) => setPendingStart(d)}
                                    modifiers={[datePickerStyle("graphical"), frame({ width: 270, height: 280 })]}
                                />
                                <SwiftDatePicker
                                    selection={pendingEnd}
                                    onDateChange={(d) => setPendingEnd(d)}
                                    modifiers={[datePickerStyle("graphical"), frame({ width: 270, height: 280 })]}
                                />
                            </HStack>
                        </SwiftScrollView>
                        <HStack modifiers={[frame({ maxWidth: 99999 }), padding({ horizontal: 16, vertical: 12 })]}>
                            <SwiftButton
                                label="Cancel"
                                role="cancel"
                                onPress={() => {
                                    setPendingStart(dates.start)
                                    setPendingEnd(dates.end)
                                    setShow(false)
                                }}
                            />
                            <Spacer />
                            <SwiftButton
                                label="Apply"
                                onPress={() => {
                                    setDates({ start: pendingStart, end: pendingEnd })
                                    setShow(false)
                                }}
                                modifiers={[bold()]}
                            />
                        </HStack>
                    </VStack>
                </Popover.Content>
            </Popover>
        </Host>
    )
}
