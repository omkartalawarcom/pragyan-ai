# Pragyan AI - Android Application Source & Build Guide

This directory contains the complete native Android project files for **Pragyan AI**.

## How to Build the APK in 3 Steps:

### Step 1: Open in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, or Jellyfish / latest).
2. Select **Open** and choose this `android` folder.
3. Allow Gradle to synchronize dependencies.

### Step 2: Configure Server URL (Optional)
In `android/app/src/main/res/values/strings.xml`:
- For local emulator testing: `http://10.0.2.2:3000`
- For physical Android phone testing on same Wi-Fi: `http://<your-computer-ip>:3000`
- For production cloud deployment: Set to your hosted Cloud Run URL.

### Step 3: Build Debug or Release APK
- In Android Studio menu: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
- Or via terminal:
  ```bash
  cd android
  ./gradlew assembleDebug
  ```
- Your APK will be generated at:
  `android/app/build/outputs/apk/debug/app-debug.apk`

Transfer the APK to your Android device and install it!
