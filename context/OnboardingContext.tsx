import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "habcat_onboarding_complete";
const ONBOARDING_STEP_KEY = "habcat_onboarding_step";

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingContextType {
  showOnboarding: boolean;
  isLoading: boolean;
  step: OnboardingStep;
  firstHabitId: number | null;
  setFirstHabitId: (id: number) => void;
  advanceStep: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState<OnboardingStep>(1);
  const [firstHabitId, setFirstHabitId] = useState<number | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (completed === "true") {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
      const savedStep = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
      if (savedStep) {
        setStep(parseInt(savedStep, 10) as OnboardingStep);
      }
    }
    setIsLoading(false);
  };

  const advanceStep = async () => {
    const nextStep = (step + 1) as OnboardingStep;
    setStep(nextStep);
    await AsyncStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString());
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    setShowOnboarding(false);
    setStep(1);
    setFirstHabitId(null);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    setStep(1);
    setFirstHabitId(null);
    setShowOnboarding(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        isLoading,
        step,
        firstHabitId,
        setFirstHabitId,
        advanceStep,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
