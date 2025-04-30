import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { Appbar } from "react-native-paper";

export default function TopBar() {
  const router = useRouter();
  return (
    <>
      {/* Add Stack.Screen to configure header options */}
      <Stack.Screen
        options={{
          // Hide the default header to only show your custom TopBar
          headerShown: false,
          // Or if you want to keep it but customize:
          // title: "Profile", // This will change index/profile to just "Profile"
          // headerBackTitle: "Back", // This will change (tabs) to "Back"
        }}
      />
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => {}} />
        <Appbar.Content title="Dead Reckoner" />
        <Appbar.Action
          icon="account-circle"
          onPress={() => router.navigate("/profile")}
        />
      </Appbar.Header>
    </>
  );
}
