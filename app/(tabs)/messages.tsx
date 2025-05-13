import { StyleSheet, FlatList, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function TabFourScreen() {
  // Mocked message threads
  const [threads] = useState([
    {
      id: "1",
      name: "Alice Johnson",
      lastMessage: "See you at 5pm!",
      time: "2:30 PM",
    },
    {
      id: "2",
      name: "Bob Smith",
      lastMessage: "Got it, thanks!",
      time: "1:15 PM",
    },
    {
      id: "3",
      name: "Charlie Brown",
      lastMessage: "Let's catch up soon.",
      time: "Yesterday",
    },
  ]);

  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.threadContainer}
      onPress={() =>
        router.push({
          pathname: "../message-thread",
          params: { threadId: item.id },
        })
      }
    >
      <View>
        <ThemedText type="default" style={styles.threadName}>
          {item.name}
        </ThemedText>
        <ThemedText type="default" style={styles.lastMessage}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <ThemedText type="default" style={styles.time}>
        {item.time}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Messages</ThemedText>
      </ThemedView>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 8 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  threadContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  threadName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  lastMessage: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    color: "#aaa",
    fontSize: 12,
  },
});
