import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase } from "@/database";
import { colors } from "@/constants/theme";
import { Onboarding } from "@/components/Onboarding";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { ReviewPromptProvider } from "@/context/ReviewPromptContext";

function RootLayoutContent() {
  const { showOnboarding, isLoading } = useOnboarding();

  useEffect(() => {
    initDatabase();
  }, []);

  if (isLoading) {
    return null;
  }

  if (showOnboarding) {
    return (
      <>
        <Onboarding />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <ReviewPromptProvider>
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
    </ReviewPromptProvider>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <RootLayoutContent />
    </OnboardingProvider>
  );
}
