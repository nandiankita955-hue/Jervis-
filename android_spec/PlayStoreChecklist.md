# JARVIS Lite AI — Play Store Release & Performance Optimization Checklist

This audit checklist outlines the exact performance, security, and deployment criteria required to pass the Google Play Store vetting process while maintaining the target system metrics:
* **APK Size**: Under 35MB
* **Cold Launch**: Under 2 seconds
* **RAM Footprint**: Under 200MB
* **Battery Drain**: Under 1.5% hourly during passive continuous listening

---

## 🚀 Performance Optimization Checklist

### 1. APK Size Control (Target: < 35MB)
- [ ] **Enforce R8 / Proguard Shaking**: Enable full code shrinking, obfuscation, and optimization in `build.gradle.kts`. This strips out unused methods from heavy SDK libraries.
- [ ] **Android App Bundle (AAB)**: Deploy using the AAB format (`.aab`) rather than universal APKs. This allows Google Play to serve split APKs customized for the user's specific screen density and CPU architecture (e.g., `arm64-v8a`).
- [ ] **Vector Assets Only**: Re-encode all interface icons as XML Vector Drawables instead of PNGs/JPGs.
- [ ] **Dynamic Feature Modules**: Put advanced visual model libraries (like local OCR or offline image synthesis weights) into dynamic, lazy-loaded split modules. Only download them when the user triggers those specific features in Settings.

### 2. Startup Speed & Cold Launch (Target: < 2 seconds)
- [ ] **Baseline Profiles**: Generate Baseline Profiles using Jetpack Macrobenchmark. This pre-compiles our Compose rendering code and primary VM routines to machine code upon installation, decreasing launch latency by up to 30%.
- [ ] **App Startup Library**: Utilize Android's `androidx.startup` library to group initialize Room, WorkManager, and Encrypted Preferences on a single background worker instead of cascading them sequentially on the main thread.
- [ ] **Lazy Dependency Injection**: Initialize SDK configurations (like the Google GenAI or OpenRouter client) lazily upon the first request rather than in the `Application.onCreate()` callback.

### 3. RAM & Battery Mitigation (Target: < 200MB RAM)
- [ ] **Silero VAD Optimization**: Run the voice activity detection model using ONNX Runtime with quantization enabled (`int8`), minimizing speech processing RAM allocation.
- [ ] **Job Batching & Coalescing**: Batch automation trigger requests. Avoid continuous wake locks; instead, rely on BroadcastReceivers and WorkManager's strict battery-optimized scheduling.
- [ ] **Canvas Rendering Recycling**: In the Jetpack Compose Animated AI Orb layout, use `drawBehind` or explicit Canvas layouts to bypass standard Compose view recompositions, leaving the CPU idle during visual idle.

---

## 🔒 Security & Privacy Vetting

### 1. Data Protection & Cryptography
- [ ] **EncryptedSharedPreferences**: Store all third-party API Keys (Gemini, Claude, OpenAI, Groq) using AES-256 GCM encryption backstopped by the Android Keystore System.
- [ ] **SQLCipher Database**: Encrypt the Room database using SQLCipher to prevent unauthorized memory scraping of conversational history.
- [ ] **Biometric Prompt Integration**: Rely strictly on Android's secure system-level BiometricPrompt. Keep the fallback PIN locked using a secure salted SHA-256 hash inside private storage.

### 2. Permission Disclosure Policies
- [ ] **On-Demand Permission Requests**: Never request permissions on boot. Present explicit educational dialogs explaining *why* a permission is needed (e.g., explaining why Accessibility is required for the phone control automation protocol) before triggering the system dialogue.
- [ ] **Background Microphone Disclosure**: The continuous wake word feature relies on `RECORD_AUDIO`. Provide a persistent, clear notification showing the service is active, conforming to modern Android background mic safety rules.

---

## 📋 Play Store Vetting Checklist

### 1. Store Listing Metadata
- [ ] **App Name**: `JARVIS Lite AI`
- [ ] **Short Description**: `A high-performance voice-controlled AI operational assistant and automation dashboard.`
- [ ] **Full Description**: *Provide clear documentation explaining that phone controls (Flashlight, Volume, Notifications) are entirely local, permission-based, and respect user privacy.*

### 2. Policy Declared Features
- [ ] **Accessibility Service Declaration**: Submit a detailed video demonstration to the Play Console verifying that the Accessibility Service is used solely to execute user voice commands (such as "Go Home" or "Adjust Brightness") and does not collect or transmit screen data.
- [ ] **SMS & Call Log Permissions**: Declare that SMS/Phone controls are auxiliary tools requested exclusively by the user for offline automation and hands-free driving utilities.
- [ ] **Data Safety Section**: Mark that all conversational data is processed locally or proxied securely to the selected AI provider endpoint via SSL, with no third-party data tracking.
