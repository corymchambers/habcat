# Habcat

A minimalist habit tracking app with a cat mascot.

## Environment Variables

Create a `.env` file in the project root with:

```
EXPO_PUBLIC_WEB3FORMS_KEY=your_web3forms_api_key
EXPO_PUBLIC_FEEDBACK_EMAIL=your_email@example.com
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

- `EXPO_PUBLIC_WEB3FORMS_KEY` - API key from [Web3Forms](https://web3forms.com/) for the feedback form
- `EXPO_PUBLIC_FEEDBACK_EMAIL` - Email address to receive user feedback
- `EXPO_PUBLIC_SENTRY_DSN` - DSN from [Sentry](https://sentry.io/) for error logging (disabled in development)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Updating Version/Build Numbers

In `app.json`, update:
- `version` - User-facing version (e.g., "1.0.0")
- `ios.buildNumber` - iOS build number (string, e.g., "2")
- `android.versionCode` - Android build number (integer, e.g., 2)

**Important:** After updating, you must run:
```bash
npx expo prebuild --clean
```

Without `--clean`, existing native values are preserved and won't update.

**Alternative:** Edit directly in native files to avoid re-running prebuild:
- iOS: Change in Xcode under **General > Identity > Build**
- Android: Edit `android/app/build.gradle` → `versionCode` and `versionName`

## Building for Android

### First-time setup: Release signing

1. Generate a release keystore (stored in project root to survive prebuild):

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias habcat -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add credentials to `~/.gradle/gradle.properties` (user-level, never touched by prebuild):

   ```properties
   # Habcat Android signing
   HABCAT_UPLOAD_STORE_FILE=/Users/corychambers/Code/habcat/release.keystore
   HABCAT_UPLOAD_KEY_ALIAS=habcat
   HABCAT_UPLOAD_STORE_PASSWORD=your_password
   HABCAT_UPLOAD_KEY_PASSWORD=your_password
   ```

3. The keystore is already in `.gitignore`

### After running `prebuild` or `prebuild --clean`

After generating the android folder, add the release signing config to `android/app/build.gradle`:

1. Find the `signingConfigs` block and add a `release` config:

   ```gradle
   signingConfigs {
       debug {
           storeFile file('debug.keystore')
           storePassword 'android'
           keyAlias 'androiddebugkey'
           keyPassword 'android'
       }
       release {
           if (project.hasProperty('HABCAT_UPLOAD_STORE_FILE')) {
               storeFile file(HABCAT_UPLOAD_STORE_FILE)
               storePassword HABCAT_UPLOAD_STORE_PASSWORD
               keyAlias HABCAT_UPLOAD_KEY_ALIAS
               keyPassword HABCAT_UPLOAD_KEY_PASSWORD
           }
       }
   }
   ```

2. Update `buildTypes.release` to use it:

   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
           // ... rest of existing config
       }
   }
   ```

### Automating signing with a config plugin (optional)

To avoid manually re-adding signing config after every `prebuild --clean`, you can use a config plugin:

- **Pre-built plugin:** [expo-signed](https://github.com/akayakagunduz/expo-signed)
- **DIY guide:** [How I Manage Signing Configs with Expo Prebuild](https://medium.com/@alessandro.orlich_17521/how-i-manage-signing-configs-with-expo-prebuild-6ea6b7576dff)
- **Official docs:** [Create a release build locally](https://docs.expo.dev/guides/local-app-production/)

### Build commands

Build a release AAB (for Google Play):

```bash
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Build a debug APK (for direct testing):

```bash
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Building for iOS

### First-time setup

Add your Apple Team ID to `app.json` so Xcode auto-selects your team:

```json
"ios": {
  "appleTeamId": "YOUR_TEAM_ID"
}
```

Find your Team ID in Xcode under **Signing & Capabilities** or at [developer.apple.com](https://developer.apple.com/account) → Membership Details.

### Development testing

Run on simulator:
```bash
npx expo run:ios
```

Run on a specific simulator:
```bash
npx expo run:ios --device "iPhone SE"
```

List available simulators:
```bash
xcrun simctl list devices available
```

### Release build steps

1. Generate the native iOS project:

   ```bash
   npx expo prebuild -p ios
   ```

2. Open in Xcode and build:

   ```bash
   open ios/Habcat.xcworkspace
   ```

3. Archive and upload via **Product > Archive**, then **Distribute App > App Store Connect**

## Clean rebuild

If you need to regenerate native projects (e.g., after changing bundle identifiers or version numbers):

```bash
npx expo prebuild --clean
```

**Note:** After this, you only need to re-add the signing config code to `build.gradle` (see Android section above). The credentials in `~/.gradle/gradle.properties` and the keystore file are preserved.
