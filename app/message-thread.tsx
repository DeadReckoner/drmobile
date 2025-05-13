import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Mocked threads data for demonstration
const THREADS: Record<string, { id: string; text: string; sender: string }[]> =
  {
    "1": [
      { id: "1", text: "Hey there!", sender: "them" },
      { id: "2", text: "Hi! How are you?", sender: "me" },
      { id: "3", text: "Doing well, thanks!", sender: "them" },
    ],
    "2": [
      { id: "1", text: "Did you get the file?", sender: "me" },
      { id: "2", text: "Yes, thanks!", sender: "them" },
    ],
    "3": [
      { id: "1", text: "Let's catch up soon.", sender: "them" },
      { id: "2", text: "Sure, let me know when!", sender: "me" },
    ],
  };

export default function MessageThreadScreen() {
  const { threadId } = useLocalSearchParams();
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string }[]
  >([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load messages for the selected thread
    if (threadId && typeof threadId === "string" && THREADS[threadId]) {
      setMessages(THREADS[threadId]);
    } else {
      setMessages([]);
    }
  }, [threadId]);

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "me" },
    ]);
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "me" ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <ThemedText style={styles.messageText}>{item.text}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  messagesList: {
    padding: 12,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: "75%",
    marginBottom: 12,
    padding: 10,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: "#d1e7ff",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 24, // Move input bar up by 24px
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 8,
    color: "#222",
  },
  sendButton: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
