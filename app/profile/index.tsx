import { StyleSheet, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { Avatar, Button, Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useSessionContext } from "../SessionContext";

export default function Profile() {
  const session = useSessionContext();
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Smith");

  useEffect(() => {
    async function getUserInfo() {
      try {
        const res = await fetch("http://127.0.0.1:8080/user", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        });
        const json = await res.json();
        console.log(json);
        setFirstName(json.first_name);
        setLastName(json.last_name);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }

    getUserInfo();
  }, [session.session?.access_token]);

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
        <Text variant="displayMedium">
          {firstName}
          {"  "}
          {lastName}
        </Text>
      </View>
      <View
        style={[
          styles.container,
          {
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
