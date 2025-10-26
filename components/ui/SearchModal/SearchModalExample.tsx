import React from "react"
import { View, StyleSheet } from "react-native"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import Button from "../Button/Button"
import Text from "../Text/Text"
import { SearchModal, SearchItem, useSearchModal } from "./index"

// Example data types
interface ExerciseSearchItem extends SearchItem {
    muscleGroup: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
}

interface PersonSearchItem extends SearchItem {
    email: string
    role: string
}

// Sample data
const sampleExercises: ExerciseSearchItem[] = [
    {
        id: "1",
        title: "Push-ups",
        subtitle: "Chest, Triceps, Shoulders",
        description: "A fundamental bodyweight exercise that targets multiple muscle groups",
        muscleGroup: "Chest",
        difficulty: "Beginner",
        icon: <MaterialIcons name="fitness-center" size={24} color={Colors.secondary} />
    },
    {
        id: "2", 
        title: "Pull-ups",
        subtitle: "Lats, Biceps, Upper Back",
        description: "Vertical pulling exercise using body weight",
        muscleGroup: "Back",
        difficulty: "Intermediate",
        icon: <MaterialIcons name="fitness-center" size={24} color={Colors.secondary} />
    },
    {
        id: "3",
        title: "Squats",
        subtitle: "Quads, Glutes, Hamstrings",
        description: "Fundamental lower body compound movement",
        muscleGroup: "Legs",
        difficulty: "Beginner",
        icon: <MaterialIcons name="fitness-center" size={24} color={Colors.secondary} />
    },
    {
        id: "4",
        title: "Deadlifts",
        subtitle: "Full Body",
        description: "The king of all exercises - works the entire posterior chain",
        muscleGroup: "Full Body",
        difficulty: "Advanced",
        icon: <MaterialIcons name="fitness-center" size={24} color={Colors.secondary} />
    },
]

const samplePeople: PersonSearchItem[] = [
    {
        id: "1",
        title: "John Doe",
        subtitle: "Software Engineer",
        description: "Frontend developer with 5 years experience",
        email: "john@example.com",
        role: "Engineer",
        icon: <AntDesign name="user" size={24} color={Colors.ternary} />
    },
    {
        id: "2",
        title: "Jane Smith", 
        subtitle: "Product Manager",
        description: "Experienced PM specializing in mobile products",
        email: "jane@example.com",
        role: "Manager",
        icon: <AntDesign name="user" size={24} color={Colors.ternary} />
    },
]

export default function SearchModalExample() {
    // Single select example
    const exerciseSearch = useSearchModal<ExerciseSearchItem>({
        onSelect: (exercise) => {
            console.log("Selected exercise:", exercise.title)
        }
    })
    
    // Multi-select example
    const peopleSearch = useSearchModal<PersonSearchItem>({
        multiSelect: true,
        onMultiSelect: (people) => {
            console.log("Selected people:", people.map(p => p.title))
        }
    })
    
    // Async search function example
    const searchExercises = async (query: string): Promise<ExerciseSearchItem[]> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return sampleExercises.filter(exercise =>
            exercise.title.toLowerCase().includes(query.toLowerCase()) ||
            exercise.muscleGroup.toLowerCase().includes(query.toLowerCase()) ||
            exercise.difficulty.toLowerCase().includes(query.toLowerCase())
        )
    }
    
    return (
        <View style={styles.container}>
            <Text variant="heading" style={styles.title}>
                Search Modal Examples
            </Text>
            
            <View style={styles.buttonContainer}>
                <Button
                    variant="secondary"
                    onPress={exerciseSearch.show}
                    style={styles.button}
                >
                    Search Exercises (Single Select)
                </Button>
                
                <Button
                    variant="primary"
                    onPress={peopleSearch.show}
                    style={styles.button}
                >
                    Search People (Multi Select)
                </Button>
            </View>
            
            {peopleSearch.selectedItems.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedTitle}>
                        Selected: {peopleSearch.selectedItems.map(p => p.title).join(", ")}
                    </Text>
                    <Button
                        variant="text"
                        onPress={peopleSearch.clearSelection}
                        style={styles.clearButton}
                    >
                        Clear Selection
                    </Button>
                </View>
            )}
            
            {/* Exercise Search Modal */}
            <SearchModal
                isVisible={exerciseSearch.isVisible}
                onDismiss={exerciseSearch.hide}
                onItemSelect={exerciseSearch.handleItemSelect}
                title="Search Exercises"
                placeholder="Search by name, muscle group, or difficulty..."
                searchFunction={searchExercises}
                emptyStateMessage="No exercises found"
                emptyStateIcon={<MaterialIcons name="search-off" size={48} color={Colors.foreground_secondary} />}
            />
            
            {/* People Search Modal */}
            <SearchModal
                isVisible={peopleSearch.isVisible}
                onDismiss={peopleSearch.hide}
                onMultiSelect={peopleSearch.handleMultiSelect}
                selectedItems={peopleSearch.selectedItems}
                title="Search People"
                placeholder="Search by name, role, or email..."
                data={samplePeople}
                multiSelect={true}
                emptyStateMessage="No people found"
                emptyStateIcon={<AntDesign name="team" size={48} color={Colors.foreground_secondary} />}
                renderFooter={() => (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {peopleSearch.selectedCount} selected
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.primary,
    },
    title: {
        color: Colors.foreground,
        textAlign: "center",
        marginBottom: 30,
    },
    buttonContainer: {
        gap: 15,
        marginBottom: 20,
    },
    button: {
        marginHorizontal: 10,
    },
    selectedContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    selectedTitle: {
        color: Colors.foreground,
        fontSize: 14,
        marginBottom: 10,
    },
    clearButton: {
        alignSelf: "flex-start",
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
        alignItems: "center",
    },
    footerText: {
        color: Colors.foreground_secondary,
        fontSize: 14,
    },
})