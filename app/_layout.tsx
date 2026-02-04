import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { initDatabase } from "@/database";
import { colors } from "@/constants/theme";
import { Onboarding } from "@/components/Onboarding";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { ReviewPromptProvider } from "@/context/ReviewPromptContext";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

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
