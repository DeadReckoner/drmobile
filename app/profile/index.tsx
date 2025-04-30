import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { supabase } from "@/lib/supabase";
import { Button } from "react-native-paper";

export default function Profile() {
  async function signOut() {
    let { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hello World!!</ThemedText>
        <HelloWave />
      </ThemedView>
      <Button mode="contained" onPress={() => signOut()}>
        {" "}
        Sign Out
      </Button>
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
