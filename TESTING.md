# Regression Testing Checklist

## Day Rollover

- [ ] Leave app in background overnight, open next morning - Today screen should show unchecked habits for the new day, not yesterday's checked state
- [ ] Leave app in background overnight, open History tab - should show correct date ranges relative to the new day
- [ ] Verify "Today" and "Yesterday" labels in History are correct after day rollover

## Today Screen

- [ ] Checking a habit updates the completion count immediately
- [ ] Unchecking a habit shows confirmation dialog
- [ ] Cat mascot changes to celebrating when all habits complete
- [ ] Haptic feedback fires on check/uncheck

## History Screen

- [ ] Navigate to Today, check off habits, navigate to History - stats should refresh and show updated completion percentage
- [ ] Days with no scheduled habits show "No data" (italic)
- [ ] Days with scheduled habits but 0 completions show "0/X" (not "No data")
- [ ] Expanding a day shows individual habit completion status
- [ ] Expanded cards have proper spacing (marginTop)
- [ ] Week/Month/Year/Custom filter buttons all work
- [ ] Current streak and longest streak calculate correctly
- [ ] Completion percentage math is correct: completed / expected habits for days that had scheduled habits

## Calendar Picker (History - Custom Date Range)

- [ ] Test in light mode - picker should be readable
- [ ] Test in dark mode (Simulator: Features > Toggle Appearance) - picker should still be readable (white background with dark text)
- [ ] Start date picker respects end date as maximum
- [ ] End date picker respects start date as minimum and today as maximum
- [ ] Cancel button dismisses without saving
- [ ] Done button applies the selected date

## Onboarding

- [ ] Keyboard does not cover the habit name input field (Step 2)
- [ ] KeyboardAvoidingView pushes content up when keyboard appears
- [ ] Default selected days are Mon-Fri (not just Sunday)
- [ ] Day selector buttons don't overflow on narrow screens (iPhone SE)
- [ ] All 7 day buttons are visible and tappable

## Day Selector Component

- [ ] Buttons use flexbox and don't rely on window dimensions
- [ ] Buttons maintain aspect ratio on different screen widths
- [ ] Selected state is visually distinct
- [ ] Works in both Onboarding and Edit Habit screens

## Habits Management

- [ ] Adding a new habit appears in the list
- [ ] Editing a habit updates name and days
- [ ] Deleting a habit removes it from all screens
- [ ] Habit with specific days only appears on Today screen on those days

## Settings

- [ ] Version and build number display correctly
- [ ] Feedback form opens and submits
- [ ] Reset data clears all habits and completions

## Review Prompt

- [ ] Triggers after completing all habits multiple times (not on first completion)
- [ ] "Remind me later" dismisses and allows future prompts
- [ ] "Never ask again" permanently dismisses

## Cross-Platform

- [ ] Test on iOS simulator
- [ ] Test on iOS physical device
- [ ] Test on Android emulator
- [ ] Test on Android physical device
- [ ] Test on smallest supported screen (iPhone SE / small Android)

## Build Verification

- [ ] iOS build archives without errors
- [ ] Android release AAB is signed with release key (not debug)
- [ ] Version/build numbers updated in app.json before release
