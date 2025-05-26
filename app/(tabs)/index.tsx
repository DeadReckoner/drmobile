import React, { useState } from "react";
import { Image, StyleSheet } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TaskCard } from "@/components/TaskCard";

import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  // Mock data for today's tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Morning Standup Meeting",
      description: "Join the team call at 9:00 AM.",
      completed: false,
    },
    {
      id: 2,
      title: "Write Project Update",
      description: "Summarize progress and blockers.",
      completed: false,
    },
    {
      id: 3,
      title: "Review Pull Requests",
      description: "Check and approve pending PRs.",
      completed: true,
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  async function signOut() {
    let { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Todays Tasks</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
            completed={task.completed}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
