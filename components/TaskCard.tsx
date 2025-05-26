import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface TaskCardProps {
  title: string;
  description: string;
  completed: boolean;
  onToggle: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  completed,
  onToggle,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <View style={[styles.box, completed && styles.checkedBox]}>
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16, // increased rounding
    padding: 20, // increased padding
    marginVertical: 12, // more vertical margin
    marginHorizontal: 16, // add horizontal margin
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: "#666",
    fontSize: 14,
  },
  checkbox: {
    marginLeft: 12,
  },
  box: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: "#888",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  checkedBox: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
