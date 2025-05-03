import { Image, StyleSheet, Platform, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { supabase } from "@/lib/supabase";
import { Avatar, Button, Text } from "react-native-paper";
import { useState } from "react";

export default function Profile() {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Smith");
  async function signOut() {
    let { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }
  return (
    <>
      <View
        style={[
          styles.container,
          {
            flexDirection: "row",
            justifyContent: "center",
          },
        ]}
      >
        <Avatar.Icon
          size={200}
          icon="account-circle-outline"
          color="black"
          style={[styles.userIcon]}
        />
      </View>
      <View
        style={[
          styles.container,
          {
            flexDirection: "row",
            justifyContent: "center",
          },
        ]}
      >
        <Text
          variant="displayMedium"
          // style={[
          //   styles.container,
          //   {
          //     marginLeft: 25,
          //   },
          // ]}
        >
          {firstName}
          {"  "}
          {lastName}
        </Text>
      </View>
      <View
        style={[
          styles.container,
          {
            // Try setting `flexDirection` to `"row"`.
            flexDirection: "column",
            justifyContent: "flex-end",
          },
        ]}
      >
        <Button
          style={[styles.signOut]}
          mode="contained"
          onPress={() => signOut()}
        >
          {" "}
          Sign Out
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  signOut: {
    marginBottom: 25,
  },
  userIcon: {
    backgroundColor: "white",
  },
});

function GetUserInfo() {}
