import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_STATE_KEY = 'habcat_review_state';
const COMPLETION_DAYS_KEY = 'habcat_completion_days';

interface ReviewState {
  hasResponded: boolean; // User selected "Yes" or "Not really"
  hasDeclined: boolean; // User selected "Not really" - never ask again
  lastPromptDate: string | null; // For 30-day cooldown after "Not now"
}

interface ReviewPromptContextType {
  shouldShowReviewPrompt: boolean;
  recordFullCompletion: (date: string) => Promise<void>;
  markPromptShown: () => void;
  handleYesResponse: () => void;
  handleNotReallyResponse: () => void;
  handleNotNowResponse: () => Promise<void>;
  handleReviewComplete: () => Promise<void>;
  dismissPrompt: () => void;
  forceShowPrompt: () => void;
  resetReviewState: () => Promise<void>;
}

const ReviewPromptContext = createContext<ReviewPromptContextType | null>(null);

const REQUIRED_COMPLETION_DAYS = 3;
const COOLDOWN_DAYS = 30;

export function ReviewPromptProvider({ children }: { children: ReactNode }) {
  const [reviewState, setReviewState] = useState<ReviewState>({
    hasResponded: false,
    hasDeclined: false,
    lastPromptDate: null,
  });
  const [completionDays, setCompletionDays] = useState<string[]>([]);
  const [shouldShowReviewPrompt, setShouldShowReviewPrompt] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const [stateJson, daysJson] = await Promise.all([
        AsyncStorage.getItem(REVIEW_STATE_KEY),
        AsyncStorage.getItem(COMPLETION_DAYS_KEY),
      ]);

      if (stateJson) {
        setReviewState(JSON.parse(stateJson));
      }
      if (daysJson) {
        setCompletionDays(JSON.parse(daysJson));
      }
    } catch (e) {
      console.error('Failed to load review state:', e);
    }
    setIsLoaded(true);
  };

  const saveReviewState = async (state: ReviewState) => {
    setReviewState(state);
    await AsyncStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(state));
  };

  const saveCompletionDays = async (days: string[]) => {
    setCompletionDays(days);
    await AsyncStorage.setItem(COMPLETION_DAYS_KEY, JSON.stringify(days));
  };

  // Check if we should show the prompt based on all conditions
  const checkShouldShowPrompt = useCallback(
    (state: ReviewState, days: string[]): boolean => {
      // Never show if user declined ("Not really")
      if (state.hasDeclined) return false;

      // Never show if user completed the review flow ("Yes" -> "Leave review")
      if (state.hasResponded) return false;

      // Check 30-day cooldown after "Not now"
      if (state.lastPromptDate) {
        const lastDate = new Date(state.lastPromptDate);
        const now = new Date();
        const daysSincePrompt = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSincePrompt < COOLDOWN_DAYS) return false;
      }

      // Need at least 3 different days of full completion
      if (days.length < REQUIRED_COMPLETION_DAYS) return false;

      return true;
    },
    []
  );

  // Record a full completion day (all habits done)
  const recordFullCompletion = async (date: string) => {
    if (!isLoaded) return;

    // Don't record if already in the list
    if (completionDays.includes(date)) return;

    const newDays = [...completionDays, date];
    await saveCompletionDays(newDays);

    // Check if we should now show the prompt
    if (checkShouldShowPrompt(reviewState, newDays)) {
      setShouldShowReviewPrompt(true);
    }
  };

  const markPromptShown = () => {
    // Called when prompt is displayed - no state change needed yet
  };

  const handleYesResponse = () => {
    // User likes the app - will show follow-up prompt
    // Don't mark as responded yet, wait for final action
  };

  const handleNotReallyResponse = () => {
    // User doesn't like it - never ask again
    // Don't dismiss yet - let the component show the feedback prompt first
    const newState = { ...reviewState, hasDeclined: true, hasResponded: true };
    saveReviewState(newState);
  };

  const handleNotNowResponse = async () => {
    // User selected "Not now" - 30 day cooldown
    const newState = {
      ...reviewState,
      lastPromptDate: new Date().toISOString(),
    };
    await saveReviewState(newState);
    setShouldShowReviewPrompt(false);
  };

  const handleReviewComplete = async () => {
    // User completed the review flow (tapped "Leave a review")
    const newState = { ...reviewState, hasResponded: true };
    await saveReviewState(newState);
    setShouldShowReviewPrompt(false);
  };

  const dismissPrompt = () => {
    setShouldShowReviewPrompt(false);
  };

  const forceShowPrompt = () => {
    setShouldShowReviewPrompt(true);
  };

  const resetReviewState = async () => {
    const defaultState: ReviewState = {
      hasResponded: false,
      hasDeclined: false,
      lastPromptDate: null,
    };
    await saveReviewState(defaultState);
    await saveCompletionDays([]);
  };

  return (
    <ReviewPromptContext.Provider
      value={{
        shouldShowReviewPrompt,
        recordFullCompletion,
        markPromptShown,
        handleYesResponse,
        handleNotReallyResponse,
        handleNotNowResponse,
        handleReviewComplete,
        dismissPrompt,
        forceShowPrompt,
        resetReviewState,
      }}
    >
      {children}
    </ReviewPromptContext.Provider>
  );
}

export function useReviewPrompt() {
  const context = useContext(ReviewPromptContext);
  if (!context) {
    throw new Error('useReviewPrompt must be used within ReviewPromptProvider');
  }
  return context;
}
