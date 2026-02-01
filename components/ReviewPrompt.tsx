import { borderRadius, colors, fontSize, spacing } from '@/constants/theme';
import { useReviewPrompt } from '@/context/ReviewPromptContext';
import * as StoreReview from 'expo-store-review';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FeedbackForm } from './FeedbackForm';

type Step = 'initial' | 'positive' | 'negative' | 'feedback';

interface ReviewPromptProps {
  visible: boolean;
}

export function ReviewPrompt({ visible }: ReviewPromptProps) {
  const [step, setStep] = useState<Step>('initial');

  const {
    handleYesResponse,
    handleNotReallyResponse,
    handleNotNowResponse,
    handleReviewComplete,
    dismissPrompt,
  } = useReviewPrompt();

  const resetAndClose = () => {
    setStep('initial');
    dismissPrompt();
  };

  const onYesPress = () => {
    handleYesResponse();
    setStep('positive');
  };

  const onNotReallyPress = () => {
    handleNotReallyResponse();
    setStep('negative');
  };

  const onLeaveReviewPress = async () => {
    await handleReviewComplete();
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
    resetAndClose();
  };

  const onNotNowPress = async () => {
    await handleNotNowResponse();
    resetAndClose();
  };

  const onSendFeedbackPress = () => {
    setStep('feedback');
  };

  const onNoThanksPress = () => {
    resetAndClose();
  };

  // Feedback form step - use shared FeedbackForm component
  if (step === 'feedback') {
    return (
      <FeedbackForm
        visible={visible}
        onClose={resetAndClose}
        title="Share your feedback"
        description="What could we do better?"
      />
    );
  }

  // Initial prompt: "Are you enjoying Habcat?"
  if (step === 'initial') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Are you enjoying Habcat?</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={onNotReallyPress}
              >
                <Text style={styles.buttonSecondaryText}>Not really</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={onYesPress}>
                <Text style={styles.buttonText}>Yes, I like it</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Positive path: "Would you mind leaving a quick review?"
  if (step === 'positive') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>That's great to hear!</Text>
            <Text style={styles.description}>
              Would you mind leaving a quick review? It really helps.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={onNotNowPress}
              >
                <Text style={styles.buttonSecondaryText}>Not now</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={onLeaveReviewPress}>
                <Text style={styles.buttonText}>Leave a review</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Negative path: "Want to share what's not working?"
  if (step === 'negative') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Thanks for telling us</Text>
            <Text style={styles.description}>
              Want to share what's not working?
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={onNoThanksPress}
              >
                <Text style={styles.buttonSecondaryText}>No thanks</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={onSendFeedbackPress}>
                <Text style={styles.buttonText}>Send feedback</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonSecondary: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
