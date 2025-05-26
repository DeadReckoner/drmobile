import { StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GoalCard } from "@/components/GoalCard";

export default function TabTwoScreen() {
  // Mock data for goals
  const goals = [
    {
      id: 1,
      title: "Run a Marathon",
      completedTasks: 0,
      totalTasks: 20,
      daysToNextMilestone: 14,
    },
    {
      id: 2,
      title: "Read 12 Books",
      completedTasks: 3,
      totalTasks: 12,
      daysToNextMilestone: 7,
    },
    {
      id: 3,
      title: "Learn React Native",
      completedTasks: 8,
      totalTasks: 15,
      daysToNextMilestone: 3,
    },
    {
      id: 4,
      title: "Save $5,000",
      completedTasks: 15,
      totalTasks: 20,
      daysToNextMilestone: 30,
    },
  ];

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Progress</ThemedText>
      </ThemedView>

      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          title={goal.title}
          completedTasks={goal.completedTasks}
          totalTasks={goal.totalTasks}
          daysToNextMilestone={goal.daysToNextMilestone}
        />
      ))}
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
  },
});
