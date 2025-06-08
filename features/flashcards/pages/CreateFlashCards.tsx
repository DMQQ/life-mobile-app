import { ActivityIndicator, FlatList, KeyboardAvoidingView, ScrollView, Text, View, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import { useState } from "react";
import lowOpacity from "@/utils/functions/lowOpacity";
import Colors from "@/constants/Colors";
import { useFlashCards } from "../hooks";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { useFormik } from "formik";
import * as yup from "yup";
import Layout from "@/constants/Layout";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import { gql, useLazyQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";

const CustomTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ value: string; text: string; icon: string }>;
  activeTab: string;
  onTabChange: (value: string) => void;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          onPress={() => onTabChange(tab.value)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 6,
            backgroundColor: activeTab === tab.value ? Colors.secondary : "transparent",
          }}
        >
          <Ionicons name={tab.icon as any} size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: activeTab === tab.value ? "bold" : "normal",
            }}
          >
            {tab.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function CreateFlashCards({ navigation, route }: any) {
  const groupId = route.params?.groupId;
  const [activeTab, setActiveTab] = useState("manual");

  const tabs = [
    { value: "manual", text: "Manual", icon: "create-outline" },
    { value: "json", text: "JSON", icon: "document-outline" },
    { value: "ai", text: "AI", icon: "sparkles-outline" },
  ];

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ flex: 1, paddingBottom: 15 }}>
        <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "json" && <JSONImportForm groupId={groupId} navigation={navigation} />}
        {activeTab === "ai" && <AIGeneratedFlashCards groupId={groupId} />}
        {activeTab === "manual" && <FlashCardForm groupId={groupId} />}
      </View>
    </View>
  );
}

const JSONImportForm = ({ groupId, navigation }: { groupId: string; navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const { createFlashCard } = useFlashCards(groupId);

  const handleFilePicker = async () => {
    const file = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: "application/json",
    });

    if (file.canceled === false) {
      const assets = file.assets[0];
      setLoading(true);

      const fileContent = await fetch(assets.uri).then((res) => res.json());

      if (!Array.isArray(fileContent)) {
        alert("Invalid JSON file");
        setLoading(false);
        return;
      }

      if (fileContent.length === 0) {
        alert("Empty JSON file");
        setLoading(false);
        return;
      }

      const firstItem = fileContent[0];

      if (!firstItem.question || !firstItem.answer) {
        alert("Invalid JSON file");
        setLoading(false);
        return;
      }

      const flashCards = fileContent.map((item: any) => createFlashCard(item));
      await Promise.all(flashCards);
      navigation.navigate("FlashCards", { groupId });
      setLoading(false);
    }
  };

  const parsedText = (() => {
    try {
      return JSON.parse(text);
    } catch (error) {
      return [];
    }
  })();

  const isValid = !!text && Array.isArray(parsedText) && parsedText.length > 0 && parsedText[0]?.question && parsedText[0]?.answer;

  const handleSubmit = async () => {
    if (!isValid) {
      alert("Invalid JSON");
      return;
    }

    setLoading(true);

    try {
      const flashCards = parsedText.map((item: any) => createFlashCard(item));
      await Promise.all(flashCards);
      setLoading(false);
      navigation.navigate("FlashCard", { groupId });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <View>
      <Button
        onPress={handleFilePicker}
        fontStyle={{ color: Colors.secondary }}
        style={{
          backgroundColor: lowOpacity(Colors.secondary, 0.15),
        }}
      >
        Import from File
      </Button>

      <Text style={{ color: "gray", fontSize: 12, marginTop: 15 }}>
        Import flashcards from JSON file with format:{" "}
        {JSON.stringify(
          {
            question: "What is React?",
            answer: "A JavaScript library for building user interfaces.",
            explanation: "React allows developers to create large web applications that can change data without reloading the page.",
          },
          null,
          2
        )}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Or paste JSON here"
          multiline
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        {!!text && (
          <Text
            style={{
              color: isValid ? "lightgreen" : Colors.error,
              paddingLeft: 10,
              fontSize: 12,
              marginTop: 5,
            }}
          >
            {isValid ? "✓ Valid JSON" : "✗ Invalid JSON"}
          </Text>
        )}
      </View>

      <Button
        icon={loading && <ActivityIndicator size="small" color={"#fff"} />}
        disabled={!text || loading}
        onPress={handleSubmit}
        style={{ marginTop: 15 }}
      >
        {loading ? "Creating..." : "Create Flashcards"}
      </Button>
    </View>
  );
};

const validationSchema = yup.object().shape({
  question: yup.string().required("Question is required"),
  answer: yup.string().required("Answer is required"),
  explanation: yup.string(),
});

const FlashCardForm = ({ groupId }: { groupId: string }) => {
  const { createFlashCard } = useFlashCards(groupId);
  const navigation = useNavigation<any>();

  const f = useFormik({
    initialValues: {
      question: "",
      answer: "",
      explanation: "",
    },
    onSubmit: async (values) => {
      try {
        await createFlashCard(values);
        navigation.navigate("FlashCard", { groupId: groupId });
      } catch (error) {
        console.error(error);
      }
    },
    validationSchema,
  });

  return (
    <KeyboardAvoidingView behavior="position" enabled keyboardVerticalOffset={150}>
      <View>
        <ValidatedInput
          placeholder="Question (required)"
          formik={f}
          name="question"
          label="Question"
          error={!!f.errors.question && f.touched.question}
        />
        <ValidatedInput
          placeholder="Answer (required)"
          formik={f}
          name="answer"
          label="Answer"
          error={!!f.errors.answer && f.touched.answer}
        />
        <ValidatedInput
          placeholder="Explanation (optional)"
          formik={f}
          name="explanation"
          label="Explanation"
          error={!!f.errors.explanation && f.touched.explanation}
        />

        <Button disabled={!(f.isValid && f.dirty)} onPress={() => f.handleSubmit()} style={{ marginTop: 15 }}>
          Create Flashcard
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const AIGeneratedFlashCards = ({ groupId }: { groupId: string }) => {
  const [promptContent, setPromptContent] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const { createFlashCard } = useFlashCards(groupId);
  const navigation = useNavigation<any>();

  const [queryFlashCard, state] = useLazyQuery(gql`
    query GenerateFlashCards($prompt: String!) {
      generateAIFlashcards(content: $prompt) {
        question
        answer
        explanation
      }
    }
  `);

  const toggleCardSelection = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const selectAll = () => {
    if (state.data?.generateAIFlashcards) {
      const allIndices = state.data.generateAIFlashcards.map((_, index) => index);
      setSelectedCards(new Set(allIndices));
    }
  };

  const deselectAll = () => {
    setSelectedCards(new Set());
  };

  const saveSelectedCards = async () => {
    if (!state.data?.generateAIFlashcards || selectedCards.size === 0) return;

    setSaving(true);
    try {
      const cardsToSave = Array.from(selectedCards).map((index) => state.data.generateAIFlashcards[index]);
      const promises = cardsToSave.map((card) => createFlashCard(card));
      await Promise.all(promises);

      setSelectedCards(new Set());
      navigation.navigate("FlashCard", { groupId });
    } catch (error) {
      console.error(error);
      alert("Failed to save flashcards");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Input
        multiline
        value={promptContent}
        onChangeText={setPromptContent}
        placeholder="Enter topics or content (e.g., 'base64, JWT, React hooks')"
        placeholderTextColor={"gray"}
        style={{
          minHeight: 80,
          textAlignVertical: "top",
        }}
      />

      <Button
        onPress={() => {
          if (!promptContent.trim()) {
            alert("Please enter a prompt");
            return;
          }
          queryFlashCard({
            variables: { prompt: promptContent },
          });
        }}
        icon={state.loading && <ActivityIndicator size="small" color={Colors.secondary} />}
        fontStyle={{ color: Colors.secondary, fontWeight: "600" }}
        style={{
          backgroundColor: lowOpacity(Colors.secondary, 0.15),
          marginTop: 15,
          flexDirection: "row-reverse",
        }}
        disabled={state.loading}
      >
        {state.loading ? "Generating..." : "Generate Flashcards"}
      </Button>

      <View style={{ flex: 1, justifyContent: "space-between", height: "100%" }}>
        {state.data?.generateAIFlashcards && (
          <View style={{ marginTop: 20, flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Cards ({selectedCards.size}/{state.data.generateAIFlashcards.length})
              </Text>
              <View style={{ flexDirection: "row", gap: 15 }}>
                <TouchableOpacity onPress={selectAll}>
                  <Text style={{ color: Colors.secondary, fontSize: 14 }}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deselectAll}>
                  <Text style={{ color: "gray", fontSize: 14 }}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={state.data.generateAIFlashcards}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item: flashCard, index }) => (
                <TouchableOpacity
                  onPress={() => toggleCardSelection(index)}
                  style={{
                    marginVertical: 4,
                    padding: 12,
                    backgroundColor: selectedCards.has(index) ? lowOpacity(Colors.secondary, 0.2) : Colors.primary_lighter,
                    borderRadius: 6,
                    borderWidth: selectedCards.has(index) ? 1 : 0,
                    borderColor: selectedCards.has(index) ? Colors.secondary : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, marginBottom: 4 }}>{flashCard.question}</Text>
                      <Text style={{ color: "#ccc", fontSize: 12, marginBottom: 3 }}>{flashCard.answer}</Text>
                      {flashCard.explanation && (
                        <Text style={{ color: "gray", fontSize: 11, fontStyle: "italic" }}>{flashCard.explanation}</Text>
                      )}
                    </View>
                    <Ionicons
                      name={selectedCards.has(index) ? "checkbox" : "square-outline"}
                      size={18}
                      color={selectedCards.has(index) ? Colors.secondary : "gray"}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>
              )}
              style={{ flex: 1, paddingBottom: 15 }}
            />
          </View>
        )}
      </View>
      {selectedCards.size > 0 && (
        <Button
          onPress={saveSelectedCards}
          icon={saving && <ActivityIndicator size="small" color="#fff" />}
          style={{
            backgroundColor: Colors.secondary,
          }}
          disabled={saving}
        >
          {saving ? "Saving..." : `Save Selected (${selectedCards.size})`}
        </Button>
      )}
    </View>
  );
};
