# Project JARVIS Lite AI — Android Architecture File Tree

This is the Clean Architecture & MVVM module design for the native Android application. It ensures a modular, high-performance, battery-efficient layout with isolated services and a clear separation of concerns.

```text
project-root/
│
├── build.gradle.kts                  # Project-level Gradle script
├── settings.gradle.kts               # Gradle settings (modules setup)
│
├── app/
│   ├── build.gradle.kts              # App-level Gradle script with Material3, WorkManager, Room, & Gemini dependencies
│   ├── proguard-rules.pro            # R8/Proguard optimization rules (under 35MB target)
│   │
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml   # Permission declarations (Microphone, Accessibility, Overlay, etc.)
│       │   │
│       │   ├── assets/
│       │   │   └── VAD_model.onnx     # Voice Activity Detection offline model weights
│       │   │
│       │   └── java/com/jarvis/lite/   # Core Kotlin package root
│       │       │
│       │       ├── MainActivity.kt    # Main activity, screen UI entry, PIN/Biometric lock handler
│       │       │
│       │       ├── data/              # DATA LAYER (Repositories, DB, APIs)
│       │       │   ├── local/
│       │       │   │   ├── JervisDatabase.kt       # Encrypted Room DB config
│       │       │   │   ├── MemoryDao.kt            # DAO for Memory entries (short/long term)
│       │       │   │   ├── MemoryEntity.kt         # Database schemas
│       │       │   │   └── EncryptedPrefs.kt       # Encrypted SharedPreferences for API keys
│       │       │   │
│       │       │   └── remote/
│       │       │       ├── GeminiApiClient.kt      # Google GenAI REST client proxy
│       │       │       └── OpenAiApiClient.kt      # OpenAI compatible endpoint router
│       │       │
│       │       ├── domain/            # DOMAIN LAYER (Business logic and Use Cases)
│       │       │   ├── model/
│       │       │   │   ├── MemoryRecord.kt
│       │       │   │   └── AutomationRoutine.kt
│       │       │   │
│       │       │   └── repository/
│       │       │       ├── MemoryRepository.kt
│       │       │       └── RoutineRepository.kt
│       │       │
│       │       ├── presentation/      # PRESENTATION LAYER (Jetpack Compose, ViewModels)
│       │       │   ├── viewmodel/
│       │       │   │   ├── JervisViewModel.kt       # Main orchestrator (Orb state, text, logic)
│       │       │   │   └── SecurityViewModel.kt     # Handles login, PIN, biometric status
│       │       │   │
│       │       │   └── ui/
│       │       │       ├── theme/
│       │       │       │   ├── Color.kt             # Sophisticated dark/AMOLED stark palette
│       │       │       │   ├── Theme.kt             # Material3 Dynamic configuration
│       │       │       │   └── Type.kt              # Typographic scaling system
│       │       │       │
│       │       │       ├── DashboardScreen.kt       # Holographic main screen & Animated AI Orb
│       │       │       ├── SettingsScreen.kt        # Toggle center, keys, and model overrides
│       │       │       └── SecurityLockScreen.kt    # Biometric verification view
│       │       │
│       │       ├── services/          # SYSTEMS & BACKGROUND SERVICES
│       │       │   ├── AssistantService.kt          # Accessibility Service for system-level automation
│       │       │   ├── BackgroundTaskWorker.kt      # WorkManager scheduled routines handler
│       │       │   └── NotificationListener.kt      # Notification scraping & smart reply engine
│       │       │
│       │       ├── voice/             # VOCAL ENGINE PIPELINE
│       │       │   ├── SpeechToTextManager.kt       # Android SpeechRecognizer bridge (Offline backup)
│       │       │   ├── TextToSpeechManager.kt       # Android TTS synthesizers
│       │       │   └── VoiceActivityDetector.kt     # Silero VAD based audio filter
│       │       │
│       │       ├── automation/        # AUTOMATION ROUTINES ENGINE
│       │       │   ├── TriggerReceiver.kt           # BroadcastReceiver for Charging, WiFi, Bluetooth, Jack
│       │       │   └── RoutineEvaluator.kt          # Executes custom IF-THEN-ELSE flows
│       │       │
│       │       └── plugins/           # EXTENSION SDK & PLUGIN ARCHITECTURE
│       │           ├── PluginManager.kt             # Handles external plugin registration
│       │           └── JervisPluginSdk.kt           # Sandboxed interfaces for third-party extensions
│       │
│       └── test/                      # Testing matrix
│           ├── JervisUnitTests.kt
│           └── InstrumentedTests.kt
```
