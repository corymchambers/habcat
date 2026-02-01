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

1. Generate a release keystore:

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore android/app/release.keystore -alias habcat -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add the keystore to `.gitignore`:

   ```bash
   echo "android/app/release.keystore" >> .gitignore
   ```

3. Add credentials to `android/gradle.properties`:

   ```properties
   MYAPP_UPLOAD_STORE_FILE=release.keystore
   MYAPP_UPLOAD_KEY_ALIAS=habcat
   MYAPP_UPLOAD_STORE_PASSWORD=your_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_password
   ```

4. Update `android/app/build.gradle` - add release signing config:

   ```gradle
   signingConfigs {
       debug {
           storeFile file('debug.keystore')
           storePassword 'android'
           keyAlias 'androiddebugkey'
           keyPassword 'android'
       }
       release {
           if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
               storeFile file(MYAPP_UPLOAD_STORE_FILE)
               storePassword MYAPP_UPLOAD_STORE_PASSWORD
               keyAlias MYAPP_UPLOAD_KEY_ALIAS
               keyPassword MYAPP_UPLOAD_KEY_PASSWORD
           }
       }
   }
   ```

   Then update `buildTypes.release` to use it:

   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
           // ... rest of existing config
       }
   }
   ```

### Build commands

1. Generate the native Android project:

   ```bash
   npx expo prebuild -p android
   ```

2. Build a release AAB (for Google Play):

   ```bash
   cd android && ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

3. Or build a debug APK (for direct testing):

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
