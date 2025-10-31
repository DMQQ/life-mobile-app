import React, { useState } from "react"
import { View, Alert } from "react-native"
import { Button, Text } from "@/components"
import { useActivityManager } from "@/utils/hooks/useActivityManager"

const LiveActivityDemo: React.FC = () => {
    const {
        isSupported,
        isInProgress,
        activeActivities,
        startActivity,
        completeActivity,
        cancelActivity,
        cancelAllActivities
    } = useActivityManager()
    
    const [isStarting, setIsStarting] = useState(false)

    const handleStartActivity = async () => {
        setIsStarting(true)
        
        try {
            const config = {
                eventId: `demo-activity-${Date.now()}`,
                title: "Demo Countdown",
                description: "Testing Live Activity with countdown timer",
                endTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
                deepLinkURL: "lifeapp://activity/demo"
            }
            
            const result = await startActivity(config)
            
            if (result) {
                Alert.alert("Success", "Live Activity started successfully!")
            } else {
                Alert.alert("Error", "Failed to start Live Activity. Make sure you're on a physical iPhone 14+ device.")
            }
        } catch (error) {
            Alert.alert("Error", `Failed to start Live Activity: ${error}`)
        } finally {
            setIsStarting(false)
        }
    }

    const handleCompleteLatest = () => {
        if (activeActivities.length > 0) {
            completeActivity(activeActivities[0])
        }
    }

    const handleCancelLatest = () => {
        if (activeActivities.length > 0) {
            cancelActivity(activeActivities[0])
        }
    }

    return (
        <View style={{ padding: 20, gap: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Live Activity Demo</Text>
            
            <Text>Supported: {isSupported ? "✅" : "❌"}</Text>
            <Text>In Progress: {isInProgress ? "✅" : "❌"}</Text>
            <Text>Active Activities: {activeActivities.length}</Text>
            
            <Button
                title={isStarting ? "Starting..." : "Start 5-min Countdown"}
                onPress={handleStartActivity}
                disabled={isStarting || !isSupported}
            />
            
            <Button
                title="Complete Latest Activity"
                onPress={handleCompleteLatest}
                disabled={activeActivities.length === 0}
            />
            
            <Button
                title="Cancel Latest Activity"
                onPress={handleCancelLatest}
                disabled={activeActivities.length === 0}
            />
            
            <Button
                title="Cancel All Activities"
                onPress={cancelAllActivities}
                disabled={activeActivities.length === 0}
            />
            
            <Text style={{ fontSize: 12, color: "gray", marginTop: 10 }}>
                Note: Live Activities with Dynamic Island only work on physical iPhone 14 Pro/Pro Max or newer devices.
                {"\n"}Test on simulator: Only lock screen notifications will show.
                {"\n"}Test on real device: Full Dynamic Island experience.
            </Text>
        </View>
    )
}

export default LiveActivityDemo