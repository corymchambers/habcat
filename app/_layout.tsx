import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase } from "@/database";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="new-habit"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-habit"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
