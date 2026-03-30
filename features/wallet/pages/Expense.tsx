import Header from "@/components/ui/Header/Header"
import Select from "@/components/ui/Select/Select"
import Colors from "@/constants/Colors"
import Url from "@/constants/Url"
import { Expense as ExpenseType } from "@/types"
import { parseDate } from "@/utils/functions/parseDate"
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons"
import axios from "axios"
import moment from "moment"
import { ReactNode, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem"
import useDeleteActivity from "../hooks/useDeleteActivity"
import useRefund from "../hooks/useRefundExpense"
import useSubscription from "../hooks/useSubscription"
import useGetSubscriptions from "../hooks/useGetSubscriptions"

import { CategoryUtils, Icons } from "../components/Expense/ExpenseIcon"

const similarCategories = {
    food: ["drinks"],
    drinks: ["food"],
    transport: ["travel"],
    travel: ["transportation"],
    entertainment: ["subscriptions", "gifts"],
    electronics: ["subscriptions", "gifts", "entertainment"],
} as const

const useGetSimilarExpenses = ({ description: name, date, category, type, amount }: ExpenseType) => {
    return useLazyQuery(
        gql`
            query GetSimilarExpenses($filters: GetWalletFilters, $skip: Int, $take: Int) {
                wallet {
                    id
                    balance
                    expenses(filters: $filters, take: $take, skip: $skip) {
                        id
                        amount
                        date
                        description
                        type
                        category
                        balanceBeforeInteraction
                        note
                        subscription {
                            id
                            isActive
                            nextBillingDate
                            dateStart
                        }
                    }
                }
            }
        `,
        {
            variables: {
                filters: {
                    title: name,
                    amount: {
                        from: amount - amount * 0.5,
                        to: amount + amount * 0.5,
                    },
                    date: {
                        // from: moment(date).subtract(30, "days").format("YYYY-MM-DD"),
                        // to: moment(date).add(30, "days").format("YYYY-MM-DD"),
                    },
                    category: [
                        category,
                        ...(similarCategories[category as keyof typeof similarCategories] || []),
                    ].filter(Boolean),
                    type,
                },
                skip: 0,
                take: 6,
            },
        },
    )
}

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
    <Text
        style={{
            color: props.color ?? Colors.secondary,
            fontSize: props.size,
            fontWeight: "bold",
            lineHeight: props.size + 7.5,
        }}
    >
        {props.children}
    </Text>
)

export default function Expense({ route: { params }, navigation }: any) {
    const { data, error } = useQuery(
        gql`
            query Expense($id: ID!) {
                expense(expenseId: $id) {
                    id
                    amount
                    date
                    description
                    type
                    category
                    balanceBeforeInteraction
                    note

                    subscription {
                        id
                        isActive
                        nextBillingDate
                        dateStart
                    }

                    location {
                        id
                        kind
                        name
                        latitude
                        longitude
                    }

                    files {
                        id
                        url
                    }

                    subexpenses {
                        id
                        description
                        amount
                        category
                    }
                }
            }
        `,
        { variables: { id: params?.expense?.id } },
    )

    const [selected, setSelected] = useState(params?.expense)

    useEffect(() => {
        if (data?.expense) {
            setSelected(data.expense)
        }
    }, [data?.expense])

    const [refund, { loading: refundLoading }] = useRefund((data) => {
        if (data.refundExpense.type !== "refunded") return

        setSelected({
            ...selected,
            type: "refunded",
        })
    })

    const [getLazyExpenses, { data: similar, called }] = useGetSimilarExpenses(selected)
    const [calls, setCalls] = useState(0)
    useEffect(() => {
        if (selected != null) {
            getLazyExpenses()
        }
    }, [selected])

    useEffect(() => {
        if (!called || calls > 1) return

        if (similar?.wallet?.expenses?.length === 1) {
            getLazyExpenses({
                variables: {
                    filters: {
                        title: "",
                        amount: {
                            from: 0,
                            to: 1000000,
                        },
                        date: {
                            // from: moment(selected.date).subtract(30, "days").format("YYYY-MM-DD"),
                            // to: moment(selected.date).add(30, "days").format("YYYY-MM-DD"),
                        },
                        category: [
                            selected?.category,
                            ...(similarCategories[selected.category as keyof typeof similarCategories] || []),
                        ].filter(Boolean),
                        type: selected.type,
                    },
                    skip: 0,
                    take: 6,
                },
            })
            setCalls(calls + 1)
        }
    }, [similar?.wallet?.expenses, calls])

    const handleRefund = () => {
        Alert.alert("Refund Expense", "Are you sure you want to refund this expense?", [
            {
                onPress: async () => {
                    try {
                        await refund({ variables: { expenseId: selected.id } })
                    } catch (error) {
                        Alert.alert("Error", "Failed to refund the expense. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const subscription = useSubscription()
    const { data: subscriptionsData } = useGetSubscriptions()
    const isSubscriptionLoading =
        subscription.createSubscriptionState.loading ||
        subscription.cancelSubscriptionState.loading ||
        subscription.assignExpenseToSubscriptionState.loading

    const hasSubscription = !!selected?.subscription?.id

    const isSubscriptionActive = hasSubscription && selected?.subscription?.isActive

    const subscriptionOptions = [{ id: null, description: "None" }, ...(subscriptionsData?.subscriptions || [])]

    const handleAssignSubscription = async (subscriptionId: string | null) => {
        try {
            const result = await subscription.assignExpenseToSubscription({
                variables: {
                    expenseId: selected.id,
                    subscriptionId,
                },
            })

            if (result.data?.assignExpenseToSubscription) {
                setSelected(result.data.assignExpenseToSubscription)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to assign subscription. Please try again.")
        }
    }

    const handleSubscriptionAction = () => {
        const actionTitle = hasSubscription
            ? isSubscriptionActive
                ? "Disable Subscription"
                : "Enable Subscription"
            : "Create Monthly Subscription"

        Alert.alert(actionTitle, `Are you sure you want to ${actionTitle.toLowerCase()}?`, [
            {
                onPress: async () => {
                    try {
                        if (isSubscriptionActive && selected?.subscription?.id) {
                            const result = await subscription.cancelSubscription({
                                variables: { subscriptionId: selected.subscription.id },
                            })

                            if (result.data?.cancelSubscription) {
                                setSelected(result.data.cancelSubscription)
                            }
                        } else {
                            const result = await subscription.createSubscription({
                                variables: { expenseId: selected.id },
                            })

                            if (result.data?.createSubscription) {
                                setSelected(result.data.createSubscription)
                            }
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to update subscription. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const { deleteActivity } = useDeleteActivity()

    const handleDelete = async () => {
        const onRemove = async () => {
            if (typeof selected?.id !== "undefined")
                await deleteActivity({
                    variables: {
                        id: selected?.id,
                    },

                    onCompleted() {
                        navigation.goBack()
                    },
                })
        }

        Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
            {
                onPress: onRemove,
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const handleEdit = () => {
        navigation.navigate("CreateExpense", {
            ...selected,
            isEditing: true,
        })
    }

    const [deleteSubExpense] = useMutation(gql`
        mutation ($id: ID!) {
            deleteSubExpense(id: $id)
        }
    `)

    const handleDeleteSubExpense = async (id: string) => {
        try {
            Alert.alert("Delete Sub-Expense", "Are you sure you want to delete this sub-expense?", [
                {
                    onPress: async () => {
                        try {
                            await deleteSubExpense({ variables: { id } })
                            setSelected((prev: any) => ({
                                ...prev,
                                subexpenses: prev.subexpenses.filter((item: any) => item.id !== id),
                            }))
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
                        }
                    },
                    text: "Yes",
                },
                {
                    onPress: () => {},
                    text: "Cancel",
                },
            ])
        } catch (error) {
            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
        }
    }

    const fileUploadRef = useRef<FileUploadHandle>(null)
    const mapPickerRef = useRef<MapPickerHandle>(null)

    const subscriptionMenuOptions: ContextMenuOption[] = [
        {
            label: hasSubscription
                ? isSubscriptionActive
                    ? "Disable Subscription"
                    : "Enable Subscription"
                : "Create Monthly Subscription",
            icon: hasSubscription ? (isSubscriptionActive ? "pause.circle" : "play.circle") : "plus.circle",
            onPress: handleSubscriptionAction,
            loading: isSubscriptionLoading,
        },
        ...(hasSubscription
            ? [
                  {
                      label: "Remove from Subscription",
                      icon: "xmark.circle" as const,
                      onPress: () => handleAssignSubscription(null),
                      destructive: true,
                  },
              ]
            : []),
    ]

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    return (
        <View style={{ flex: 1 }}>
            <Header
                animated
                animatedTitle={capitalize(selected?.description)}
                initialHeight={60}
                titleAnimatedStyle={{ flexWrap: "nowrap" }}
                scrollY={scrollY}
                buttons={[
                    {
                        icon: <Feather name="trash" size={20} color={Colors.foreground} />,
                        onPress: handleDelete,
                    },
                    {
                        icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                        onPress: handleEdit,
                        style: { marginLeft: 5 },
                    },
                ]}
                animatedSubtitle={`${selected.type === "expense" ? "-" : ""}${selected.amount.toFixed(2)}zł`}
                subtitleStyles={{
                    fontSize: 25,
                    color:
                        selected.type === "refunded"
                            ? Colors.secondary_light_2
                            : selected.type === "expense"
                              ? "#F07070"
                              : "#66E875",
                    marginTop: 10,
                    fontWeight: "600",
                }}
                initialTitleFontSize={selected?.description?.length > 25 ? 40 : 50}
            />
            <Animated.ScrollView
                onScroll={onScroll}
                keyboardDismissMode={"on-drag"}
                style={{
                    flex: 1,
                    paddingTop: getModalMarginTop(selected?.description),
                }}
            >
                <View style={{ marginBottom: 30, paddingHorizontal: 15 }}>
                    {selected.subexpenses?.length > 0 && (
                        <View style={{ marginTop: 15 }}>
                            <SubexpenseStack selected={selected} handleDeleteSubExpense={handleDeleteSubExpense} />

                            <View style={{ marginBottom: 15, marginTop: 10 }}>
                                <Txt size={20} color={Colors.foreground}>
                                    Expense details
                                </Txt>
                            </View>
                        </View>
                    )}

                    <View
                        style={{
                            marginTop: 20,
                            paddingBottom: 20,
                            backgroundColor: Colors.primary_light,
                            borderRadius: 15,
                        }}
                    >
                        {selected?.category && (
                            <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 7.5 }]}>
                                <CategoryIcon
                                    type={selected?.type as "expense" | "income"}
                                    category={(selected?.category || "none") as any}
                                    clear
                                />

                                <Text style={{ color: Colors.secondary_light_2, fontSize: 18, flex: 1 }}>
                                    {capitalize(CategoryUtils.getCategoryName(selected?.category || ""))}
                                </Text>

                                <Ripple
                                    onPress={() =>
                                        navigation.navigate("CorrectionMaps", {
                                            prefill: {
                                                shop: selected?.shop || undefined,
                                                description: selected?.description || undefined,
                                                category: selected?.category || undefined,
                                                amount: selected?.amount || undefined,
                                            },
                                        })
                                    }
                                    style={styles.correctionBtn}
                                >
                                    <AntDesign name="swap" size={12} color={Colors.secondary} />
                                    <Text style={styles.correctionBtnText}>Fix rule</Text>
                                </Ripple>
                            </View>
                        )}

                        <View style={styles.row}>
                            <MaterialIcons
                                name="money"
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />

                            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                                {capitalize(selected?.type)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <MaterialIcons
                                name="money"
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />

                            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                                Balance before: {selected?.balanceBeforeInteraction} zł
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <CollapsibleThemedCalendar
                            date={dayjs(selected?.date).format("YYYY-MM-DD")}
                            markedDates={{ [dayjs(selected?.date).format("YYYY-MM-DD")]: { selected: true } }}
                        />
                    </View>

                    {/* Subscription section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Subscription</Text>
                            {hasSubscription && (
                                <View
                                    style={[
                                        styles.statusPill,
                                        {
                                            backgroundColor: isSubscriptionActive
                                                ? "rgba(102,232,117,0.15)"
                                                : "rgba(255,255,255,0.07)",
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.statusDot,
                                            { backgroundColor: isSubscriptionActive ? "#66E875" : Colors.text_dark },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.statusPillText,
                                            { color: isSubscriptionActive ? "#66E875" : Colors.text_dark },
                                        ]}
                                    >
                                        {isSubscriptionActive ? "Active" : "Inactive"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {hasSubscription && (
                            <View style={styles.cardDates}>
                                <View style={styles.dateRow}>
                                    <Text style={styles.dateLabel}>
                                        {isSubscriptionActive ? "Next payment" : "Last payment"}
                                    </Text>
                                    <Text style={styles.dateValue}>
                                        {selected.subscription?.nextBillingDate
                                            ? moment(+selected.subscription.nextBillingDate).format("MMM D, YYYY")
                                            : "—"}
                                    </Text>
                                </View>
                                <View style={styles.dateRow}>
                                    <Text style={styles.dateLabel}>
                                        {isSubscriptionActive ? "Active since" : "Created on"}
                                    </Text>
                                    <Text style={styles.dateValue}>
                                        {moment(+selected.subscription.dateStart).format("MMM D, YYYY")}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={{ marginTop: 12 }}>
                            <Text style={styles.dateLabel}>Assign to subscription</Text>
                            <View style={{ marginTop: 8 }}>
                                <Select
                                    options={subscriptionOptions.map((s) => s.description)}
                                    selected={
                                        selected?.subscription?.id
                                            ? [
                                                  subscriptionOptions.find((s) => s.id === selected?.subscription?.id)
                                                      ?.description || "None",
                                              ]
                                            : ["None"]
                                    }
                                    setSelected={(selectedItems) => {
                                        const selectedSub = subscriptionOptions.find(
                                            (s) => s.description === selectedItems[0],
                                        )
                                        if (selectedSub) handleAssignSubscription(selectedSub.id)
                                    }}
                                    closeOnSelect
                                    placeholderText="Select subscription"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {similar?.wallet?.expenses?.length > 1 && (
                    <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
                        <Txt size={20} color={Colors.foreground}>
                            Recent similar expenses
                        </Txt>

                        <View style={{ marginTop: 25 }}>
                            {similar?.wallet?.expenses
                                ?.filter((items: any) => items.id !== selected?.id)
                                .map((item: any) => (
                                    <WalletItem
                                        key={item.id}
                                        {...item}
                                        handlePress={() => {
                                            navigation.push("Expense", {
                                                expense: item,
                                            })
                                        }}
                                    />
                                ))}
                        </View>
                    </View>
                )}

                <FileUpload ref={fileUploadRef} id={selected.id} images={selected?.files} />

                <MapPicker ref={mapPickerRef} location={selected.location} id={selected.id} />

                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            <FloatingBottomToolBar
                onRefund={handleRefund}
                refundLoading={refundLoading}
                isRefunded={selected?.type === "refunded"}
                onTakePhoto={() => fileUploadRef.current?.takePhoto()}
                onPickImage={() => fileUploadRef.current?.pickImage()}
                subscriptionMenuOptions={subscriptionMenuOptions}
                isSubscriptionLoading={isSubscriptionLoading}
                hasSubscription={hasSubscription}
                isSubscriptionActive={isSubscriptionActive}
                onSetLocation={() => mapPickerRef.current?.triggerSearch()}
            />
        </View>
    )
}

import Layout from "@/constants/Layout"
import * as ImagePicker from "expo-image-picker"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import ImageViewerModal from "../components/Expense/ImageViewer"
import MapPicker, { MapPickerHandle } from "../components/Expense/Map"
import SubexpenseStack from "../components/Expense/SubexpenseStack"
import getModalMarginTop from "../utils/modalMarginTop"
import FloatingBottomToolBar, { ContextMenuOption } from "../components/Expense/FloatingBottomToolBar"
import { forwardRef, useImperativeHandle } from "react"
import { CollapsibleThemedCalendar } from "@/components/ui/ThemedCalendar/ThemedCalendar"
import dayjs from "dayjs"

type FileUploadHandle = { takePhoto: () => void; pickImage: () => void }

const FileUpload = forwardRef<FileUploadHandle, { id: string; images: any[] }>((props, ref) => {
    const [files, setFiles] = useState<{ id: string; url: string }[]>(props.images ?? [])

    async function uploadPhotoAsync(photos: ImagePicker.ImagePickerResult) {
        if (photos.assets?.length === 0 || photos.canceled) return

        const photo = photos.assets[0]

        const formData = new FormData()

        const fileObject = {
            uri: photo.uri,
            name: photo.fileName || "photo.jpg",
            type: photo.type || "image/jpeg",
        }

        formData.append("file", fileObject as any)

        try {
            const { data } = await axios.post(Url.API + "/upload/single", formData, {
                params: {
                    type: "expense",
                    entityId: props.id,
                    compress: "true",
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            })

            const newFiles = Array.isArray(data) ? data : [data]
            setFiles((prev) => [...prev, ...newFiles])
            return data
        } catch (error) {
            throw error
        }
    }

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            allowsMultipleSelection: false,
            mediaTypes: "images",
            cameraType: ImagePicker.CameraType.back,
            quality: 1,
            aspect: [4, 3],
        })

        if (!result.canceled) {
            await uploadPhotoAsync(result)
        }
    }

    const handleImagesSelect = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsMultipleSelection: false,
            })

            if (!result.canceled) {
                await uploadPhotoAsync(result)
            }
        } catch (error) {
            console.error("Error selecting image:", error)
        }
    }

    useImperativeHandle(ref, () => ({
        takePhoto: handleTakePhoto,
        pickImage: handleImagesSelect,
    }))

    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    if (files.length === 0) return null

    return (
        <View style={{ paddingHorizontal: 15, marginBottom: 40 }}>
            <Txt size={20} color={Colors.foreground}>
                Attachments
            </Txt>
            <FlatList
                style={{ marginTop: 25 }}
                horizontal
                data={files}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Ripple
                        onPress={() => {
                            setSelectedImage((p) => (p === item.url ? null : item.url))
                        }}
                    >
                        <Image
                            source={{
                                uri: Url.API + "/upload/images/" + item?.url,
                            }}
                            style={{
                                width: Layout.screen.width - 45,
                                height: 250,
                                borderRadius: 10,
                                marginRight: 10,
                            }}
                            resizeMode="cover"
                        />
                    </Ripple>
                )}
            />

            <ImageViewerModal
                selectedImage={selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                }}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    text: {
        fontSize: 15,
        marginTop: 10,
        color: Colors.foreground,
        backgroundColor: Colors.secondary_dark_1,
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 100,
        marginRight: 5,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        marginTop: 10,
    },
    card: {
        marginTop: 20,
        backgroundColor: Colors.primary_light,
        borderRadius: 15,
        padding: 15,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    cardTitle: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "600",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: "600",
    },
    cardDates: {
        marginTop: 12,
        gap: 8,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateLabel: {
        color: Colors.text_dark,
        fontSize: 13,
        fontWeight: "500",
    },
    dateValue: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        fontWeight: "500",
    },
    correctionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    correctionBtnText: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "500",
    },
})
