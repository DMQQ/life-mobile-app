import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Clipboard } from "react-native";
import Colors from "@/constants/Colors";
import Button from "../ui/Button/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo.componentStack);
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  copyError = () => {
    if (this.state.error?.message) {
      Clipboard.setString(this.state.error.message);
    }
  };

  copyStackTrace = () => {
    if (this.state.error?.stack) {
      Clipboard.setString(this.state.error.stack);
    }
  };

  copyComponentStack = () => {
    if (this.state.errorInfo) {
      Clipboard.setString(this.state.errorInfo);
    }
  };

  copyAllErrors = () => {
    const errorData = [
      `Error: ${this.state.error?.message || "Unknown error"}`,
      `Stack Trace:\n${this.state.error?.stack || "No stack trace"}`,
      this.state.errorInfo ? `Component Stack:\n${this.state.errorInfo}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    Clipboard.setString(errorData);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Something went wrong</Text>
              <TouchableOpacity style={styles.copyButton} onPress={this.copyAllErrors}>
                <Text style={styles.copyButtonText}>Copy All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Error</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={this.copyError}>
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.errorText} selectable>
                  {this.state.error?.message}
                </Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Stack Trace</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={this.copyStackTrace}>
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.stackTrace} selectable>
                  {this.state.error?.stack}
                </Text>
              </View>

              {this.state.errorInfo && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Component Stack</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={this.copyComponentStack}>
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.stackTrace} selectable>
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
      );
    }

    return this.props.children;
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.error,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text_light,
  },
  copyButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  copyButtonText: {
    color: Colors.text_light,
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.primary_lighter,
    padding: 12,
    borderRadius: 6,
    fontFamily: "monospace",
  },
  stackTrace: {
    fontSize: 12,
    color: Colors.text_light,
    backgroundColor: Colors.primary_lighter,
    padding: 12,
    borderRadius: 6,
    fontFamily: "monospace",
    lineHeight: 16,
  },
});

export default ErrorBoundary;
