import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";
import { useOnboarding } from "@/context/OnboardingContext";
import { useReviewPrompt } from "@/context/ReviewPromptContext";
import { ReviewPrompt } from "@/components/ReviewPrompt";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();
  const { shouldShowReviewPrompt } = useReviewPrompt();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleViewOnboarding = async () => {
    await resetOnboarding();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.item} onPress={() => setShowFeedbackModal(true)}>
          <View style={styles.itemContent}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.foreground} />
            <Text style={styles.itemText}>Leave Feedback</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </Pressable>

        <Pressable style={styles.item} onPress={handleViewOnboarding}>
          <View style={styles.itemContent}>
            <Ionicons name="information-circle-outline" size={24} color={colors.foreground} />
            <Text style={styles.itemText}>View Welcome Screen</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ReviewPrompt visible={shouldShowReviewPrompt} />
      <FeedbackForm
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.foreground,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  itemText: {
    fontSize: fontSize.base,
    color: colors.foreground,
  },
});
