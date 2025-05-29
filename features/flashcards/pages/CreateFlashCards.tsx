import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import { useState } from "react";
import lowOpacity from "@/utils/functions/lowOpacity";
import Colors from "@/constants/Colors";
import { useFlashCards } from "../hooks";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { useFormik } from "formik";

export default function CreateFlashCards({ navigation, route }: any) {
  const groupId = route.params?.groupId;

  const [loading, setLoading] = useState(false);

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
        return;
      }

      if (fileContent.length === 0) {
        alert("Empty JSON file");
        return;
      }

      const firstItem = fileContent[0];

      if (!firstItem.question || !firstItem.answer) {
        alert("Invalid JSON file");
        return;
      }

      const flashCards = parsedText.map((item: any) => createFlashCard(item));

      await Promise.all(flashCards);

      navigation.navigate("FlashCards", { groupId });

      setLoading(false);
    }
  };

  const [text, setText] = useState("");

  const parsedText = (() => {
    try {
      return JSON.parse(text);
    } catch (error) {
      return [];
    }
  })();

  const { createFlashCard } = useFlashCards(groupId);

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
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15, paddingBottom: 45 }}>
      <View>
        <Button
          onPress={handleFilePicker}
          fontStyle={{ color: Colors.secondary }}
          style={{
            backgroundColor: lowOpacity(Colors.secondary, 0.15),
          }}
        >
          Import Flashcards from JSON
        </Button>

        <Text style={{ color: "gray", fontSize: 12, marginTop: 15 }}>
          You can import flashcards from a JSON file. The file should be an array of objects with the following keys: question, answer,
          explanation.
        </Text>

        <View style={{ marginTop: 30 }}>
          <Input value={text} onChangeText={setText} placeholder="Paste your json here" />

          {!!text && (
            <Text
              style={{
                color: isValid ? "lightgreen" : Colors.error,
                paddingLeft: 10,
              }}
            >
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </Text>
          )}
        </View>

        <Button
          icon={loading && <ActivityIndicator size="small" color={"#fff"} />}
          disabled={!!!text}
          onPress={handleSubmit}
          style={{ marginTop: 15, flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}
        >
          Create Flashcards
        </Button>

        <View
          style={{
            width: Layout.screen.width - 30,
            backgroundColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
            height: 2,
            marginVertical: 20,
          }}
        />

        <FlashCardForm groupId={groupId} />
      </View>
    </ScrollView>
  );
}

import * as yup from "yup";
import Layout from "@/constants/Layout";
import Color from "color";
import { useNavigation } from "@react-navigation/native";

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
      <View style={{ backgroundColor: Colors.primary }}>
        <Text style={{ color: "#fff", fontSize: 25, fontWeight: "bold", marginBottom: 15 }}>Create flashcard</Text>
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
          placeholder="Explanation (optional field)"
          formik={f}
          name="explanation"
          label="Explanation"
          error={!!f.errors.explanation && f.touched.explanation}
        />

        <Button disabled={!(f.isValid && f.dirty)} onPress={() => f.handleSubmit()} style={{ marginTop: 15 }}>
          Create Flashcards
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};
