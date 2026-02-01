# Habcat

A minimalist habit tracking app with a cat mascot.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

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

If you need to regenerate native projects (e.g., after changing bundle identifiers):

```bash
npx expo prebuild --clean
```

**Note:** After this, you only need to re-add the signing config code to `build.gradle` (step 3 above). The credentials in `~/.gradle/gradle.properties` and the keystore file are preserved.
