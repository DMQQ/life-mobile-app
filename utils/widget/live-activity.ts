import ExpoLiveActivity from "@/modules/expo-live-activity"

/**
 * Starts and schedules the end of a workout Live Activity.
 */
export const manageWorkoutActivity = async () => {
    // Ensure the module is loaded and functions exist
    if (!ExpoLiveActivity?.startActivity || !ExpoLiveActivity?.endActivity) {
        console.error("Required Live Activity functions are not available.")
        return
    }

    // 1. Define all parameters
    const workoutId = "workout-123-abc" // Example dynamic ID
    const deepLink = `mylifeapp://workout/${workoutId}`
    const durationInSeconds = 60 * 1 // 1 hour

    // --- IMPORTANT ---
    // We MUST send timestamps in SECONDS to match the Swift .secondsSince1970 decoder
    const startTime = Math.floor(Date.now() / 1000)
    const endTime = startTime + durationInSeconds

    // 2. Define the initial state
    const initialState = {
        title: "Workout Session",
        description: "Leg day at the gym",
        startTime: startTime, // Send as seconds
        endTime: endTime, // Send as seconds
    }

    // 3. Define the final state (what to show when it's done)
    const finalState = {
        title: "Workout Finished!",
        description: "Great job completing your leg day session.",
        startTime: startTime, // Original times so progress bar is 100%
        endTime: endTime,
    }

    // 4. Run the full sequence
    try {
        console.log("Attempting to start Live Activity...")
        // Start the activity
        const started = await ExpoLiveActivity.startActivity(
            "Workout", // name
            JSON.stringify(initialState), // jsonString
            deepLink, // deepLinkUrl
        )

        if (started) {
            console.log("Live Activity started successfully.")

            // Immediately schedule the activity to end and dismiss
            await ExpoLiveActivity.endActivity(
                JSON.stringify(finalState), // finalStateJSON
                endTime, // dismissalTime (in seconds)
            )

            console.log(`Activity scheduled to dismiss at ${new Date(endTime * 1000).toLocaleTimeString()}`)
        } else {
            console.warn("Native module reported activity start failed.")
        }
    } catch (e) {
        console.error("Error managing Live Activity:", e.message, e)
    }
}
