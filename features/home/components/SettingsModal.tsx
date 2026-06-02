import { FONTS } from "@/constants/Fonts"
import { ModalHeader } from "@/components"
import Colors from "@/constants/Colors"
import useUser from "@/utils/hooks/useUser"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Color from "color"
import React from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Text from "@/components/ui/Text/Text"
import HomeWidgetsSection from "./settings/HomeWidgetsSection"
import NotificationsSection from "./settings/NotificationsSection"
import ThemeSection from "./settings/ThemeSection"
import UpdateRow from "./settings/UpdateRow"
import WatchSection from "./settings/WatchSection"
import { Card, IconBox, SectionLabel, SettingsRow } from "./settings/SettingsComponents"

const CARD_BG = Color(Colors.primary).lighten(0.4).string()

type SettingSection = "notifications" | "watch" | "theme" | "home"

type SettingsParamList = {
    SettingsIndex: undefined
    SettingsDetail: { section: SettingSection; title: string }
}

type SP<T extends keyof SettingsParamList> = NativeStackScreenProps<SettingsParamList, T>

const SettingsStack = createNativeStackNavigator<SettingsParamList>()

export default function SettingsNavigator() {
    return (
        <SettingsStack.Navigator screenOptions={{ headerShown: true }}>
            <SettingsStack.Screen name="SettingsIndex" component={SettingsIndex} />
            <SettingsStack.Screen name="SettingsDetail" component={SettingsDetail} />
        </SettingsStack.Navigator>
    )
}

function SettingsIndex({ navigation }: SP<"SettingsIndex">) {
    const { removeUser, user } = useUser()

    const dismiss = () => {
        Feedback.trigger("impactLight")
        navigation.getParent()?.goBack()
    }

    const go = (section: SettingSection, title: string) => {
        Feedback.trigger("selection")
        navigation.navigate("SettingsDetail", { section, title })
    }

    const handleSignout = async () => {
        await removeUser()
        let keys = await AsyncStorage.getAllKeys()
        keys = keys.filter((k) => !k.startsWith("color_scheme"))
        await AsyncStorage.multiRemove(keys)
        navigation.getParent()?.goBack()
    }

    return (
        <View style={s.container}>
            <ModalHeader title="Settings" onClose={dismiss} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scroll}
                keyboardDismissMode="on-drag"
            >
                <View style={s.profileCard}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{user?.email?.[0]?.toUpperCase() ?? "U"}</Text>
                    </View>
                    <View>
                        <Text variant="body" style={s.profileEmail}>
                            {user?.email}
                        </Text>
                        <Text variant="caption" style={s.profileSub}>
                            Personal account
                        </Text>
                    </View>
                </View>

                <SectionLabel title="Preferences" />
                <Card>
                    <SettingsRow
                        icon={
                            <IconBox bg={Colors.secondary}>
                                <Feather name="bell" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Notifications"
                        onPress={() => go("notifications", "Notifications")}
                        right={<Feather name="chevron-right" size={16} color={Colors.text_dark} />}
                    />
                    <SettingsRow
                        icon={
                            <IconBox bg="#3A3A3C">
                                <Feather name="watch" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Apple Watch"
                        onPress={() => go("watch", "Apple Watch")}
                        right={<Feather name="chevron-right" size={16} color={Colors.text_dark} />}
                    />
                    <SettingsRow
                        icon={
                            <IconBox bg={Colors.ternary}>
                                <Feather name="layout" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Home Widgets"
                        isLast
                        onPress={() => go("home", "Home Widgets")}
                        right={<Feather name="chevron-right" size={16} color={Colors.text_dark} />}
                    />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="Appearance" />
                <Card>
                    <SettingsRow
                        icon={
                            <IconBox bg={Colors.ternary}>
                                <Feather name="sliders" size={16} color="#fff" />
                            </IconBox>
                        }
                        label="Color Theme"
                        isLast
                        onPress={() => go("theme", "Color Theme")}
                        right={
                            <View style={s.colorDots}>
                                <View style={[s.colorDot, { backgroundColor: Colors.secondary }]} />
                                <View style={[s.colorDot, { backgroundColor: Colors.ternary }]} />
                                <View style={[s.colorDot, { backgroundColor: Colors.foreground }]} />
                            </View>
                        }
                    />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="App" />
                <Card>
                    <UpdateRow />
                </Card>

                <View style={s.sectionGap} />
                <SectionLabel title="Account" />
                <Card>
                    <TouchableOpacity onPress={handleSignout} activeOpacity={0.65} style={s.row}>
                        <IconBox bg={Colors.danger}>
                            <Feather name="log-out" size={16} color="#fff" />
                        </IconBox>
                        <Text variant="body" style={[s.rowLabel, { color: Colors.danger }]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>
        </View>
    )
}

function SettingsDetail({ navigation, route }: SP<"SettingsDetail">) {
    const { section, title } = route.params

    return (
        <View style={s.container}>
            <ModalHeader title={title} onClose={() => navigation.goBack()} closeIcon="chevron.backward" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scroll}
                keyboardDismissMode="on-drag"
            >
                {section === "notifications" && <NotificationsSection />}
                {section === "watch" && <WatchSection />}
                {section === "theme" && <ThemeSection />}
                {section === "home" && <HomeWidgetsSection />}
            </ScrollView>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 60 },

    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: 32,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 24 },
    profileEmail: { color: Colors.text_light, fontFamily: FONTS.semibold },
    profileSub: { color: Colors.foreground_secondary, marginTop: 2 },

    sectionGap: { marginTop: 30 },

    colorDots: { flexDirection: "row", gap: 4 },
    colorDot: { width: 13, height: 13, borderRadius: 7 },

    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 50,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    rowLabel: { flex: 1, color: Colors.text_light },
})
