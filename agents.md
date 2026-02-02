# Habcat Development Notes

## Bug Fixes Applied (Feb 2026)

### 1. Keyboard Issues
- **Problem:** Keyboard was blocking habit name input when editing. Return key showed "Return" instead of "Done".
- **Fix:** Added `returnKeyType="done"`, `blurOnSubmit`, and `onSubmitEditing={() => Keyboard.dismiss()}` to all TextInputs.
- **Files affected:** `app/new-habit.tsx`, `app/edit-habit.tsx`, `components/Onboarding.tsx`, `components/FeedbackForm.tsx`

### 2. Default Selected Days
- **Problem:** Onboarding defaulted to only today's day of week instead of Monday-Friday.
- **Fix:** Changed default `selectedDays` to `['mon', 'tue', 'wed', 'thu', 'fri']`.
- **File:** `components/Onboarding.tsx`

### 3. Day Selection Buttons Overflow
- **Problem:** Day selection circles overflowed on narrow screens (e.g., smaller iPhones).
- **Fix:** Created shared `DaySelector` component that calculates button size based on screen width using `useWindowDimensions`.
- **Files:**
  - Created `components/DaySelector.tsx`
  - Updated `app/new-habit.tsx`, `app/edit-habit.tsx`, `components/Onboarding.tsx` to use it

### 4. Progress Calculation Bug
- **Problem:** Shows incorrect stats like "1/9 habits" when user only has 1 habit. Was counting expected habits for days with no data.
- **Fix:** Changed `getCompletionStats` to use `getHistoryData` which only includes days with scheduled habits.
- **File:** `database/index.ts`

### 5. Calendar Picker Broken
- **Problem:** Custom date picker was displaying incorrectly - missing month header, stray arrows, only showing one date.
- **Fix:** Updated picker styles to use full width and proper sizing.
- **File:** `app/(tabs)/history.tsx`

### 6. History Filter Buttons
- **Problem:** "Custom" button getting cut off on narrow screens.
- **Fix:** Made filter buttons use `flex: 1` to distribute evenly across screen width.
- **File:** `app/(tabs)/history.tsx`

## Android Build Notes

### Signing Configuration

The Android signing config gets reset when running `npx expo prebuild --clean`. To preserve credentials:

1. **Keystore location:** `release.keystore` in project root (survives prebuild)
2. **Credentials location:** `~/.gradle/gradle.properties` (user-level, never touched by prebuild)
   - Uses `HABCAT_` prefix to avoid conflicts with other apps

After `prebuild --clean`, you need to re-add the signing config code to `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('HABCAT_UPLOAD_STORE_FILE')) {
            storeFile file(HABCAT_UPLOAD_STORE_FILE)
            storePassword HABCAT_UPLOAD_STORE_PASSWORD
            keyAlias HABCAT_UPLOAD_KEY_ALIAS
            keyPassword HABCAT_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... rest of config
    }
}
```

## UI/UX Guidelines

- Day selection should always use circles (consistent across all screens)
- All buttons should be responsive to screen width
- Keyboard should show "Done" key, not "Return"
- TextInputs should dismiss keyboard when done is pressed
- Progress calculations should only include days with actual data
