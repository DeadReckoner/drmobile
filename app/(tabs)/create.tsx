import { StyleSheet, Image, Platform, View } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CardButton from "../../components/CardButton";

export default function TabThreeScreen() {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Create</ThemedText>
      </ThemedView>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <CardButton title="Use AI to Create your roadmap" />
        <CardButton title="Create your own roadmap" />
        <CardButton title="Create a task" />
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
  },
});
