import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GoalCardProps {
  title: string;
  completedTasks: number;
  totalTasks: number;
  daysToNextMilestone: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  completedTasks,
  totalTasks,
  daysToNextMilestone,
}) => {
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>
          Next milestone: {daysToNextMilestone} days
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    fontSize: 15,
    color: "#444",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 5,
  },
});
