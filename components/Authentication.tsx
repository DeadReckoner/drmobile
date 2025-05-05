import React, { useState, useContext, createContext } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";

enum AuthOpts {
  Hidden = 0,
  SignIn = 1,
  SignUp = 2,
}

interface AuthContextOpts {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextOpts | undefined>(undefined);
function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContext.Provider"
    );
  }
  return context;
}

const HostUrl = process.env.EXPO_PUBLIC_SERVER_URL;

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [auth_opts, setAuthOpts] = useState(AuthOpts.Hidden);

  const contextValue: AuthContextOpts = {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    setLoading,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      <View style={styles.container}>
        {auth_opts == AuthOpts.SignIn && <SignIn />}
        {auth_opts == AuthOpts.SignUp && <SignUp />}
        {auth_opts === AuthOpts.Hidden && (
          <>
            <View style={styles.verticallySpaced}>
              <Button
                title="Sign In"
                onPress={() => setAuthOpts(AuthOpts.SignIn)}
                disabled={loading}
              />
            </View>
            <View style={styles.verticallySpaced}>
              <Button
                title="Sign Up"
                onPress={() => setAuthOpts(AuthOpts.SignUp)}
                disabled={loading}
              />
            </View>
          </>
        )}
        {auth_opts != AuthOpts.Hidden && (
          <View style={styles.verticallySpaced}>
            <Button
              title="Back"
              onPress={() => setAuthOpts(AuthOpts.Hidden)}
              disabled={loading}
            />
          </View>
        )}
      </View>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 30,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});

function SignIn() {
  const ctx: AuthContextOpts = useAuthContext();

  async function signInWithEmail() {
    ctx.setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: ctx.email,
      password: ctx.password,
    });

    if (error) Alert.alert(error.message);
    ctx.setLoading(false);
  }

  return (
    <>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => ctx.setEmail(text)}
          value={ctx.email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => ctx.setPassword(text)}
          value={ctx.password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign In"
          disabled={ctx.loading}
          onPress={() => signInWithEmail()}
        />
      </View>
    </>
  );
}

function SignUp() {
  const ctx: AuthContextOpts = useAuthContext();

  async function signUpWithEmail() {
    ctx.loading = true;
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: ctx.email,
      password: ctx.password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");

    CreateUser(ctx, session);
    ctx.loading = false;
  }

  return (
    <>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="First Name"
          onChangeText={(text) => ctx.setFirstName(text)}
          value={ctx.firstName}
          placeholder="John"
          autoCapitalize={"words"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Last Name"
          onChangeText={(text) => ctx.setLastName(text)}
          value={ctx.lastName}
          placeholder="Smith"
          autoCapitalize={"words"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => ctx.setEmail(text)}
          value={ctx.email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => ctx.setPassword(text)}
          value={ctx.password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={ctx.loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </>
  );
}

function CreateUser(ctx: AuthContextOpts, session: Session | null) {
  if (session) {
    fetch(HostUrl + "/user", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify({
        first_name: ctx.firstName,
        last_name: ctx.lastName,
        email: ctx.email,
      }),
    })
      .then((response) => console.log(response.status))
      .catch((error) => console.error(error));
  }
}
