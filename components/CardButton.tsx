import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

type CardButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function CardButton(props: CardButtonProps) {
  return (
    <TouchableOpacity
      style={styles.cardButton}
      activeOpacity={0.85}
      onPress={props.onPress}
    >
      <View style={styles.contentRow}>
        <Text variant="titleMedium" style={styles.title}>
          {props.title}
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={22} color="#007aff" />
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  cardButton: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center", // Center content vertically
    justifyContent: "center", // Center content horizontally
    flexDirection: "row", // Needed for horizontal centering
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center content horizontally
    width: "100%",
    gap: 12,
  },
  title: {
    color: "#222",
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center", // Center text
    flex: 0,
  },
});
