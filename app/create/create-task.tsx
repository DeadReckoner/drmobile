import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>Create a Task</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity
        onPress={() => setShowStart(true)}
        style={styles.dateButton}
      >
        <ThemedText style={styles.dateButtonText}>
          Start: {startDate.toLocaleDateString()}
        </ThemedText>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event: any, date?: Date) => {
            setShowStart(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      <TouchableOpacity
        onPress={() => setShowEnd(true)}
        style={styles.dateButton}
      >
        <ThemedText style={styles.dateButtonText}>
          End: {endDate.toLocaleDateString()}
        </ThemedText>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event: any, date?: Date) => {
            setShowEnd(false);
            if (date) setEndDate(date);
          }}
        />
      )}
      <TouchableOpacity style={styles.createButton}>
        <ThemedText style={styles.createButtonText}>Create</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "flex-start",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#007aff",
  },
  createButton: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
