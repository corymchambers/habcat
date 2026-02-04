import { borderRadius, colors, fontSize, spacing } from '@/constants/theme';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const WEB3FORMS_KEY = process.env.EXPO_PUBLIC_WEB3FORMS_KEY;

interface FeedbackFormProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function FeedbackForm({
  visible,
  onClose,
  title = 'Leave Feedback',
  description = 'What could we do better?',
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSending(true);
    try {
      if (WEB3FORMS_KEY) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: 'Habcat Feedback',
            from_name: 'Habcat App',
            email: userEmail.trim() || 'no-reply@habcat.app',
            message: feedback.trim(),
          }),
        });
      } else {
        console.log('Feedback submitted (no API key):', {
          feedback: feedback.trim(),
          userEmail: userEmail.trim() || null,
        });
      }
      setFeedbackSent(true);
    } catch (e) {
      console.error('Failed to send feedback:', e);
      setFeedbackSent(true);
    }
    setIsSending(false);
  };

  const handleClose = () => {
    setFeedback('');
    setUserEmail('');
    setFeedbackSent(false);
    onClose();
  };

  if (feedbackSent) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Thank you!</Text>
            <Text style={styles.description}>
              Your feedback helps us improve Habcat.
            </Text>
            <Pressable style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <TextInput
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Tell us what's on your mind..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit
          />
          <TextInput
            style={styles.emailInput}
            value={userEmail}
            onChangeText={setUserEmail}
            placeholder="Your email (optional)"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleClose}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                (!feedback.trim() || isSending) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!feedback.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <Text style={styles.buttonText}>Send</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
    paddingBottom: 56,
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
  feedbackInput: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  emailInput: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
    marginBottom: spacing.lg,
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
    minHeight: 60,
  },
  buttonSecondary: {
    backgroundColor: colors.muted,
  },
  buttonDisabled: {
    opacity: 0.5,
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
