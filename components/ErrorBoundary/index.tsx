import React, { Component, ReactNode } from "react"
import { View, TouchableOpacity, ScrollView, StyleSheet, Clipboard } from "react-native"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import Button from "../ui/Button/Button"
import { SafeAreaView } from "react-native-safe-area-context"

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: string) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: string | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            errorInfo: errorInfo.componentStack ?? null,
        })

        this.props.onError?.(error, errorInfo.componentStack ?? "")
    }

    handleRestart = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    copyError = () => {
        if (this.state.error?.message) {
            Clipboard.setString(this.state.error.message)
        }
    }

    copyStackTrace = () => {
        if (this.state.error?.stack) {
            Clipboard.setString(this.state.error.stack)
        }
    }

    copyComponentStack = () => {
        if (this.state.errorInfo) {
            Clipboard.setString(this.state.errorInfo)
        }
    }

    copyAllErrors = () => {
        const errorData = [
            `Error: ${this.state.error?.message || "Unknown error"}`,
            `Stack Trace:\n${this.state.error?.stack || "No stack trace"}`,
            this.state.errorInfo ? `Component Stack:\n${this.state.errorInfo}` : "",
        ]
            .filter(Boolean)
            .join("\n\n")

        Clipboard.setString(errorData)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text size={24} weight="600" color={Colors.danger}>Something went wrong</Text>
                            <TouchableOpacity style={styles.copyButton} onPress={this.copyAllErrors}>
                                <Text size={12} weight="500" color={Colors.text_light}>Copy All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text size={16} weight="600" color={Colors.text_light}>Error</Text>
                                    <TouchableOpacity style={styles.copyButton} onPress={this.copyError}>
                                        <Text size={12} weight="500" color={Colors.text_light}>Copy</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text size={14} color={Colors.danger} style={styles.errorText} selectable>
                                    {this.state.error?.message}
                                </Text>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text size={16} weight="600" color={Colors.text_light}>Stack Trace</Text>
                                    <TouchableOpacity style={styles.copyButton} onPress={this.copyStackTrace}>
                                        <Text size={12} weight="500" color={Colors.text_light}>Copy</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text size={12} color={Colors.text_light} lineHeight={16} style={styles.stackTrace} selectable>
                                    {this.state.error?.stack}
                                </Text>
                            </View>

                            {this.state.errorInfo && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text size={16} weight="600" color={Colors.text_light}>Component Stack</Text>
                                        <TouchableOpacity style={styles.copyButton} onPress={this.copyComponentStack}>
                                            <Text size={12} weight="500" color={Colors.text_light}>Copy</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text size={12} color={Colors.text_light} lineHeight={16} style={styles.stackTrace} selectable>
                                        {this.state.errorInfo}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                        <Button variant="primary" type="contained" onPress={this.handleRestart}>
                            Restart
                        </Button>
                    </View>
                </SafeAreaView>
            )
        }

        return this.props.children
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        padding: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary_lighter,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    copyButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    errorText: {
        backgroundColor: Colors.primary_lighter,
        padding: 12,
        borderRadius: 6,
        fontFamily: "monospace",
    },
    stackTrace: {
        backgroundColor: Colors.primary_lighter,
        padding: 12,
        borderRadius: 6,
        fontFamily: "monospace",
    },
})

export default ErrorBoundary
