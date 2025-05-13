import { StyleSheet, Image, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CardButton from "../../components/CardButton";

export default function TabThreeScreen() {
  const router = useRouter();
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.createTitle}>
          Create
        </ThemedText>
      </ThemedView>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
          paddingHorizontal: 20, // Match the horizontal margin of the title block
          boxSizing: "border-box", // Ensure padding is included in width
        }}
      >
        <CardButton title="Use AI to Create your roadmap" />
        <CardButton title="Create your own roadmap" />
        <CardButton
          title="Create a task"
          onPress={() => router.push("/create/create-task")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    justifyContent: "flex-start",
    paddingVertical: 32, // Increased vertical padding
    marginHorizontal: 20, // Increased horizontal margin
    borderRadius: 20, // More rounded edges
    backgroundColor: "#fff", // Make it look like a block
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 0.5,
    textShadowColor: "#e0e0e0",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "center", // Center the text itself
    flex: 1, // Allow it to take up available space for centering
  },
});
