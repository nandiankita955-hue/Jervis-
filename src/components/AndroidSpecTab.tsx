import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileCode, 
  Terminal, 
  Clipboard, 
  Check, 
  FolderTree, 
  Settings, 
  ShieldAlert, 
  Cpu, 
  Sparkles,
  Info,
  Smartphone,
  Wifi,
  Battery,
  BatteryCharging,
  Shield,
  Zap,
  Play,
  Volume2,
  RefreshCw,
  Search,
  CheckCircle2,
  Activity,
  Flame,
  Lock,
  Unlock,
  Radio,
  Clock,
  Mic,
  Server
} from "lucide-react";

interface AndroidSpecTabProps {
  playBeep: (freq?: number, type?: OscillatorType, duration?: number, gainValue?: number) => void;
  playConfirm: () => void;
  addLog: (text: string, type: "info" | "success" | "warn" | "error" | "comm") => void;
}

const ANDROID_FILES = [
  {
    name: "FolderStructure.md",
    icon: FolderTree,
    lang: "markdown",
    desc: "Complete Clean Architecture & MVVM layout defining the modular packages.",
    code: `# Project JARVIS Lite AI — Android Architecture File Tree

This is the Clean Architecture & MVVM module design for the native Android application. It ensures a modular, high-performance, battery-efficient layout with isolated services and a clear separation of concerns.

[START ARCHITECTURE TREE]
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
[END ARCHITECTURE TREE]`
  },
  {
    name: "AndroidManifest.xml",
    icon: FileCode,
    lang: "xml",
    desc: "Vents and declares background voice listeners, system hardware toggles, and accessibility capabilities.",
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.jarvis.lite">

    <!-- Primary Device & System Control Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Phone, SMS, and Contact Integrations -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    
    <!-- Sensors, Flashlight, and Network Status -->
    <uses-permission android:name="android.permission.CAMERA" /> <!-- Flashlight & OCR -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:label="JARVIS Lite AI"
        android:theme="@style/Theme.JarvisLite">

        <!-- Launch Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.ASSIST" />
                <category android:name="android.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- Foreground Wakeword Voice Service -->
        <service
            android:name=".services.ForegroundVoiceService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="microphone|specialUse">
            <property android:name="android.app.PROPERTY_SPECIAL_USE_DESCRIPTION" 
                android:value="Hands-free vocal hotword listener." />
        </service>

        <!-- Accessibility service for hands-free automation -->
        <service
            android:name=".services.AssistantAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="JARVIS System Controller"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
        </service>
    </application>
</manifest>`
  },
  {
    name: "MainActivity.kt",
    icon: Cpu,
    lang: "kotlin",
    desc: "Jetpack Compose root integrating biometric hardware authorization, theme initialization, and ViewModel states.",
    code: `package com.jarvis.lite

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.jarvis.lite.presentation.viewmodel.JervisViewModel
import com.jarvis.lite.presentation.viewmodel.SecurityViewModel
import com.jarvis.lite.presentation.ui.DashboardScreen
import com.jarvis.lite.presentation.ui.SecurityLockScreen
import com.jarvis.lite.presentation.ui.theme.JarvisLiteTheme
import java.util.concurrent.Executor

class MainActivity : ComponentActivity() {

    private val viewModel: JervisViewModel by viewModels()
    private val securityViewModel: SecurityViewModel by viewModels()
    private lateinit var executor: Executor
    private lateinit var biometricPrompt: BiometricPrompt
    private lateinit var promptInfo: BiometricPrompt.PromptInfo

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        executor = ContextCompat.getMainExecutor(this)
        setupBiometrics()

        setContent {
            JarvisLiteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val appUnlocked by securityViewModel.appUnlocked.collectAsState()
                    val pinLockActive by securityViewModel.pinLockActive.collectAsState()

                    if (pinLockActive && !appUnlocked) {
                        SecurityLockScreen(
                            onPinEntered = { enteredPin ->
                                if (securityViewModel.verifyPin(enteredPin)) {
                                    Toast.makeText(this, "Welcome back, Sir.", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(this, "Access Denied!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onBiometricRequested = { triggerBiometricPrompt() }
                        )
                    } else {
                        DashboardScreen(
                            viewModel = viewModel,
                            onToggleVoice = { viewModel.toggleContinuousListening() },
                            onToggleFlashlight = { viewModel.toggleFlashlight(this) }
                        )
                    }
                }
            }
        }
    }

    private fun setupBiometrics() {
        biometricPrompt = BiometricPrompt(this, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    securityViewModel.unlockApp()
                }
            })

        promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("JARVIS Authorization")
            .setSubtitle("Confirm biological sign to unlock HUD")
            .setNegativeButtonText("Use PIN Backup")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build()
    }

    private fun triggerBiometricPrompt() {
        biometricPrompt.authenticate(promptInfo)
    }
}`
  },
  {
    name: "VoicePipeline.kt",
    icon: Terminal,
    lang: "kotlin",
    desc: "Robust, low-latency Speech Recognizer bridging and British-accent TextToSpeech interrupt-capable synthesizers.",
    code: `package com.jarvis.lite.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.*

class SpeechToTextManager(
    private val context: Context,
    private val onResult: (String) -> Unit,
    private val onError: (String) -> Unit
) {
    private var speechRecognizer: SpeechRecognizer? = null
    private var recognizerIntent: Intent? = null
    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening

    init {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) { _isListening.value = true }
                    override fun onEndOfSpeech() { _isListening.value = false }
                    override fun onError(error: Int) {
                        _isListening.value = false
                        onError("Recognition error: $error")
                    }
                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) onResult(matches[0])
                    }
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onPartialResults(partialResults: Bundle?) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }
            recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.UK.toString())
            }
        }
    }

    fun startListening() { speechRecognizer?.startListening(recognizerIntent) }
    fun stopListening() { speechRecognizer?.stopListening() }
}

class TextToSpeechManager(
    private val context: Context,
    private val onInitComplete: (Boolean) -> Unit
) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var isReady = false

    init { tts = TextToSpeech(context, this) }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.setLanguage(Locale.UK)
            isReady = true
            onInitComplete(true)
        } else {
            onInitComplete(false)
        }
    }

    fun speak(text: String) {
        if (!isReady) return
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "UtteranceId")
    }

    fun stop() { tts?.stop() }
}`
  },
  {
    name: "AssistantService.kt",
    icon: Settings,
    lang: "kotlin",
    desc: "Android sticky Foreground Service maintaining the microphone and executing Accessibility commands.",
    code: `package com.jarvis.lite.services

import android.accessibilityservice.AccessibilityService
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class ForegroundVoiceService : Service() {
    private val CHANNEL_ID = "JarvisVoiceServiceChannel"

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("JARVIS AI Online")
            .setContentText("Hands-free vocal matrix active")
            .setSmallIcon(android.R.drawable.presence_micro_phone)
            .build()

        startForeground(8808, notification)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

class AssistantAccessibilityService : AccessibilityService() {
    fun executeSystemCommand(command: String): Boolean {
        return when (command.lowercase().trim()) {
            "go home" -> { performGlobalAction(GLOBAL_ACTION_HOME); true }
            "back" -> { performGlobalAction(GLOBAL_ACTION_BACK); true }
            "recents" -> { performGlobalAction(GLOBAL_ACTION_RECENTS); true }
            else -> false
        }
    }
    override fun onAccessibilityEvent(event: android.view.accessibility.AccessibilityEvent?) {}
    override fun onInterrupt() {}
}`
  },
  {
    name: "NotificationListener.kt",
    icon: Settings,
    lang: "kotlin",
    desc: "Scrapes notifications from targeted apps, logging notification metadata to memory and checking for urgent priority phrases.",
    code: `package com.jarvis.lite.services

import android.app.Notification
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.jarvis.lite.data.local.JervisDatabase
import com.jarvis.lite.data.local.MemoryRecord
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class JervisNotificationListener : NotificationListenerService() {

    private val TAG = "JervisNotification"
    private val scope = CoroutineScope(Dispatchers.IO)
    private lateinit var database: JervisDatabase

    override fun onCreate() {
        super.onCreate()
        database = JervisDatabase.getDatabase(this)
        Log.i(TAG, "Jervis Secure Notification Listening Channel initialized.")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        val notification = sbn.notification
        val extras = notification.extras

        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString() ?: ""

        if (packageName == "com.jarvis.lite" || packageName == "android") return

        Log.d(TAG, "Notification Captured >> App: $packageName | Title: $title | Content: $text")

        scope.launch {
            val memoryRecord = MemoryRecord(
                key = "notification_$packageName",
                value = "Title: $title | Message: $text | Sub: $subText",
                category = "notification_history",
                timestamp = System.currentTimeMillis()
            )
            database.memoryDao().insertMemory(memoryRecord)

            evaluateNotificationTriggers(packageName, title, text)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        Log.d(TAG, "Notification Dismissed from tray: \${sbn.packageName}")
    }

    private fun evaluateNotificationTriggers(packageName: String, title: String, text: String) {
        if (packageName.contains("whatsapp") || packageName.contains("telegrams")) {
            if (text.lowercase().contains("emergency") || text.lowercase().contains("urgent")) {
                Log.w(TAG, "Urgent message detected! Triggering system priority broadcast.")
                val intent = Intent("com.jarvis.lite.EXECUTE_ACTION").apply {
                    putExtra("action_protocol", "speak_greeting")
                    putExtra("vocal_override", "Sir, an urgent message from \$title has arrived: \$text")
                }
                sendBroadcast(intent)
            }
        }
    }
}`
  },
  {
    name: "Database.kt",
    icon: FileCode,
    lang: "kotlin",
    desc: "Room ORM database layout mapping context memory tables, SQLite optimization patterns, and reactive Flows.",
    code: `package com.jarvis.lite.data.local

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "jervis_memory")
data class MemoryRecord(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "fact_key") val key: String,
    @ColumnInfo(name = "fact_value") val value: String,
    @ColumnInfo(name = "category") val category: String,
    @ColumnInfo(name = "timestamp") val timestamp: Long = System.currentTimeMillis()
)

@Dao
interface MemoryDao {
    @Query("SELECT * FROM jervis_memory ORDER BY timestamp DESC")
    fun getAllMemories(): Flow<List<MemoryRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(record: MemoryRecord)

    @Delete
    suspend fun deleteMemory(record: MemoryRecord)
}

@Database(entities = [MemoryRecord::class], version = 1, exportSchema = false)
abstract class JervisDatabase : RoomDatabase() {
    abstract fun memoryDao(): MemoryDao

    companion object {
        @Volatile private var INSTANCE: JervisDatabase? = null
        fun getDatabase(context: Context): JervisDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    JervisDatabase::class.java,
                    "jervis_system_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    name: "AutomationEngine.kt",
    icon: Sparkles,
    lang: "kotlin",
    desc: "Evaluates Broadcast Triggers (charging, WiFi, Bluetooth status changes) and schedules routines.",
    code: `package com.jarvis.lite.automation

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import com.jarvis.lite.data.local.JervisDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TriggerReceiver : BroadcastReceiver() {
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        scope.launch {
            // Evaluates triggers sequentially from local memory
            if (action == Intent.ACTION_POWER_CONNECTED) {
                val broadcastIntent = Intent("com.jarvis.lite.EXECUTE_ACTION").apply {
                    putExtra("action_protocol", "speak_greeting")
                }
                context.sendBroadcast(broadcastIntent)
            }
        }
    }
}`
  },
  {
    name: "PluginSDK.kt",
    icon: Settings,
    lang: "kotlin",
    desc: "Secure sandboxed interface defining voice capabilities and signatures for third-party APK extensions.",
    code: `package com.jarvis.lite.plugins

import android.os.Bundle
import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class JervisPluginConfig(
    val pluginId: String,
    val pluginName: String,
    val developerSignature: String,
    val requestedCapabilities: List<String>
) : Parcelable

interface IJervisPlugin {
    fun getPluginConfig(): JervisPluginConfig
    fun onVoiceCommandReceived(command: String, args: Bundle): Boolean
}`
  },
  {
    name: "build.gradle.kts",
    icon: FileCode,
    lang: "kotlin",
    desc: "Gradle build settings, kapt processors, and dependencies (Gemini, Room SQLite, WorkManager, Cryptography).",
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.kotlin.parcelize)
}

android {
    namespace = "com.jarvis.lite"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.jarvis.lite"
        minSdk = 26
        targetSdk = 35
        versionCode = 100
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }
}

dependencies {
    implementation("androidx.biometric:biometric-ktx:1.2.0-alpha05")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.room:room-runtime:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
}`
  },
  {
    name: "PlayStoreChecklist.md",
    icon: ShieldAlert,
    lang: "markdown",
    desc: "Google Play release strategy, battery optimization exceptions, and security compliance.",
    code: `# Play Store Release & Performance Checklist

- **APK Size Limit**: Enforce full R8/Proguard code shrinking for < 35MB package targets.
- **Biometrics Safety**: Maintain strict Android Keystore integration for encrypted credentials.
- **Accessibility Declaration**: Declare system-level utility routines (like flashlight or lock-screen) properly inside the Play Console.
- **Battery Optimization Exceptions**: Request user confirmation for battery optimizations whitelist to ensure continuous wake-word triggers work uninterrupted.`
  }
];

export const AndroidSpecTab: React.FC<AndroidSpecTabProps> = ({
  playBeep,
  playConfirm,
  addLog
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Stark OS Mobile State Simulator
  const [isShieldOn, setIsShieldOn] = useState(true);
  const [isCoreOverdrive, setIsCoreOverdrive] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isWifiConnected, setIsWifiConnected] = useState(true);
  const [coreTemp, setCoreTemp] = useState(38.4);
  const [ramUsage, setRamUsage] = useState(132);
  const [sysRating, setSysRating] = useState(94.8);
  const [optimizationProgress, setOptimizationProgress] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("STANDBY MODE - SIR");
  const [systemTime, setSystemTime] = useState("");
  
  // Simulated Logcat streams
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "I/StarkOS: Initializing Stark OS bootstrap kernel v10.4.8...",
    "I/JervisMainActivity: Biometrics hardware layer initialized & authenticated.",
    "D/JervisVoiceService: Background hotword listener registered on offline VAD_model.onnx",
    "I/MemoryDao: Encrypted SQLite Room Database bound: jervis_system_database.db",
    "I/TriggerReceiver: Broadcast triggers active: POWER_CONNECTED, WIFI_STATE_CHANGED",
    "I/JervisSystem: Device fully secured with 256-bit Stark PIN protocol",
    "D/StarkOS: Connected to secure gateway: STARK_NET_SECURE"
  ]);

  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Live clock effect
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setSystemTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll Logcat to bottom on new logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [simulatedLogs]);

  const addSimulatedLog = (logText: string, level: "I" | "D" | "W" | "E" = "I") => {
    const d = new Date();
    const timeStr = d.toLocaleTimeString([], { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, '0');
    setSimulatedLogs(prev => [...prev.slice(-35), `${level}/${timeStr} ${logText}`]);
  };

  const handleCopy = () => {
    playConfirm();
    navigator.clipboard.writeText(currentFile.code).then(() => {
      setCopied(true);
      addLog(`Android Source: "${currentFile.name}" copied to developer clipboard successfully!`, "success");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      addLog("Clipboard translation error.", "error");
    });
  };

  const handleSelectFile = (idx: number) => {
    playBeep(850, "sine", 0.04, 0.02);
    setSelectedFileIdx(idx);
    setCopied(false);
  };

  // Trigger Shield Toggle
  const toggleShield = () => {
    playBeep(isShieldOn ? 600 : 950, "sine", 0.08, 0.03);
    const nextState = !isShieldOn;
    setIsShieldOn(nextState);
    if (nextState) {
      addSimulatedLog("JervisSecurity: Cryptographic shield protocol active. IPSec tunneling enabled.", "I");
      addSimulatedLog("JervisSecurity: Payload encryption verified (AES-256-GCM).", "I");
      addLog("Android Emulator: Stark security shield protocol engaged.", "success");
    } else {
      addSimulatedLog("JervisSecurity: WARNING: Cryptographic shield bypassed by developer command.", "W");
      addLog("Android Emulator: Stark security shield bypassed.", "warn");
    }
  };

  // Trigger Core Overdrive
  const toggleCoreOverdrive = () => {
    playBeep(isCoreOverdrive ? 500 : 1100, "triangle", 0.1, 0.04);
    const nextState = !isCoreOverdrive;
    setIsCoreOverdrive(nextState);
    if (nextState) {
      setRamUsage(184);
      setCoreTemp(44.2);
      setSysRating(98.9);
      addSimulatedLog("JervisViewModel: Core Overdrive engaged. CPU thermal throttling disabled.", "W");
      addSimulatedLog("JervisMainActivity: Thread pool scale-out: 8 concurrent Kotlin coroutines.", "D");
      addSimulatedLog("GeminiApiClient: High-throughput token streaming buffer activated.", "I");
      addLog("Android Emulator: AI Core Overdrive engaged. Caution: thermals rising.", "warn");
    } else {
      setRamUsage(122);
      setCoreTemp(36.4);
      setSysRating(94.8);
      addSimulatedLog("JervisViewModel: Core Overdrive suspended. Standard battery-efficient governor active.", "I");
      addLog("Android Emulator: AI Core Overdrive suspended.", "info");
    }
  };

  // Simulate Android Speech recognition and wake-word trigger
  const triggerVoiceSimulation = () => {
    if (isMicListening) {
      playBeep(500, "sine", 0.05, 0.02);
      setIsMicListening(false);
      setTranscript("STANDBY MODE - SIR");
      addSimulatedLog("JervisVoiceService: Voice recognition listener suspended.", "D");
      addLog("Android Emulator: Voice listener suspended.", "warn");
      return;
    }

    playBeep(980, "sine", 0.05, 0.03);
    setIsMicListening(true);
    setTranscript("LISTENING FOR WAKEWORD...");
    addSimulatedLog("JervisVoiceService: Background microphone stream bound (44.1kHz PCM).", "D");
    addSimulatedLog("SilenceDetector: Ambient threshold calibrated to -42.5dB.", "I");
    addSimulatedLog("VAD_Model: silero_vad execution thread priority set to CRITICAL.", "D");
    addLog("Android Emulator: Voice wake-word listener thread active.", "info");

    // Simulate voice prompt detection
    setTimeout(() => {
      setIsMicListening(false);
      const prompts = [
        "JARVIS, activate core auxiliary matrix",
        "JARVIS, secure the database encryption keys",
        "JARVIS, bypass secure terminal firewall",
        "JARVIS, check reactor diagnostics telemetry",
        "JARVIS, optimize database cache lines"
      ];
      const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setTranscript(`"${selectedPrompt.toUpperCase()}"`);
      playConfirm();
      addSimulatedLog(`JervisVoiceService: Wake-word 'JARVIS' detected. Match confidence: 99.4%`, "I");
      addSimulatedLog(`JervisVoiceService: Transcribed vocal instruction: "${selectedPrompt}"`, "I");
      addSimulatedLog("GeminiApiClient: Streaming query to Google Gemini model...", "I");

      setTimeout(() => {
        addSimulatedLog("GeminiApiClient: Gemini response: 'Acknowledged, Sir. Restructuring core parameters.'", "D");
        addSimulatedLog("JervisAutomation: Executing internal action routine: EXECUTING_PROTOCOL", "I");
        setTranscript("ACTION CARRIED OUT SUCCESSFULLY");
        playBeep(920, "sine", 0.04, 0.02);
      }, 1200);

    }, 2000);
  };

  // Perform full cache / SQLite optimizer sweep
  const runDeviceOptimization = () => {
    if (optimizationProgress !== null) return;
    
    playBeep(700, "sine", 0.05, 0.02);
    setOptimizationProgress(0);
    setTranscript("INITIATING CORE SWEEP...");
    addSimulatedLog("JervisOptimizer: Initiated master device cache purge.", "I");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setOptimizationProgress(progress);
      playBeep(700 + progress * 2.5, "sine", 0.03, 0.015);

      if (progress === 20) {
        addSimulatedLog("JervisOptimizer: Halting duplicate companion daemon processes...", "D");
      } else if (progress === 60) {
        addSimulatedLog("JervisOptimizer: Sweeping volatile RAM garbage caches...", "D");
        setRamUsage(104);
      } else if (progress === 80) {
        addSimulatedLog("JervisOptimizer: Re-aligning index markers inside Room SQLite tables...", "I");
      } else if (progress >= 100) {
        clearInterval(interval);
        setOptimizationProgress(null);
        setCoreTemp(33.2);
        setRamUsage(88);
        setSysRating(100.0);
        setTranscript("STARK OS OPTIMAL - 100% HEALTH");
        playConfirm();
        addSimulatedLog("JervisOptimizer: Cache sweep successful. 44MB heap RAM recovered.", "I");
        addSimulatedLog("JervisSystem: Re-calibrated thermal profile. Device is 100% OPTIMAL.", "I");
        addLog("Android Emulator: Full system calibration complete. 44MB memory cleared.", "success");
      }
    }, 150);
  };

  const currentFile = ANDROID_FILES[selectedFileIdx];

  return (
    <div className="flex flex-col gap-4 h-full select-text">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-[#14325c]/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#0e2142] border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-xs text-[#e2f1ff] uppercase tracking-wider">
              Android Native Build Workspace (মাস্টার সোর্স ডেক)
            </h3>
            <p className="text-[9px] text-[#5e7ea8] uppercase tracking-wide">
              Clean MVVM Jetpack Compose & SQLite Core Framework
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-[8px] px-2.5 py-1 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 font-bold uppercase tracking-widest">
          EMBEDDED EMULATOR PORT: 3000
        </div>
      </div>

      {/* Main split grid: Android Simulator on left, Code explorer on right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch min-h-[550px]">
        
        {/* Left Side: Futuristic Android Phone / Stark OS Emulator HUD */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="bg-[#050b18] border border-[#1d4c8c]/50 rounded-2xl p-3 flex flex-col flex-1 relative overflow-hidden shadow-[0_0_25px_rgba(4,10,25,0.8)]">
            
            {/* Absolute overlay background circuit grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(16,42,82,0.12),transparent)] pointer-events-none" />
            <div className="absolute top-0 right-0 h-20 w-20 bg-cyan-500/5 blur-2xl rounded-full pointer-events-none" />
            
            {/* Phone Emulator Frame Header / Simulated Hardware Status */}
            <div className="flex items-center justify-between text-[8px] text-[#3bc0ff]/80 font-bold uppercase pb-2 mb-2 border-b border-[#14325c]/40 select-none relative z-10">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Smartphone className="h-3 w-3 shrink-0" />
                <span>STARK_PHONE_V1</span>
              </div>
              
              {/* Camera Notch Punch Hole simulation */}
              <div className="h-4 w-12 bg-[#02040a] border border-[#14325c]/50 rounded-full flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/60 animate-pulse" />
              </div>

              <div className="flex items-center gap-2 text-[#5179ad]">
                <Wifi className={`h-3 w-3 ${isWifiConnected ? "text-cyan-400" : "text-red-500"}`} />
                <span className="text-[8px] tracking-tight">{systemTime}</span>
                <div className="flex items-center gap-0.5">
                  <BatteryCharging className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-black">98%</span>
                </div>
              </div>
            </div>

            {/* Simulated Phone Screen Interface */}
            <div className="flex-1 bg-[#02050d] border border-[#14325c]/30 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              
              {/* Neon Ambient scanning overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-30" />

              {/* Holographic JARVIS AI Orb Visualizer */}
              <div className="flex flex-col items-center justify-center py-3 relative">
                
                {/* Orbiting Halo rings */}
                <div className="relative h-28 w-28 flex items-center justify-center">
                  
                  {/* Outer spinning dash ring */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[#1d4c8c]/40"
                  />

                  {/* Concentric Energy pulsing circles */}
                  <AnimatePresence>
                    {isMicListening && (
                      <>
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.4, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                          className="absolute h-full w-full rounded-full border-2 border-cyan-400/30"
                        />
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0.7 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, ease: "easeOut" }}
                          className="absolute h-full w-full rounded-full border border-emerald-400/20"
                        />
                      </>
                    )}
                  </AnimatePresence>

                  {/* Inner Core holographic orb */}
                  <motion.div
                    onClick={triggerVoiceSimulation}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: isMicListening ? [1, 1.1, 0.95, 1.05, 1] : [1, 1.04, 1],
                      boxShadow: isCoreOverdrive 
                        ? "0 0 25px rgba(239, 68, 68, 0.4)" 
                        : isMicListening 
                        ? "0 0 30px rgba(6, 182, 212, 0.5)"
                        : "0 0 15px rgba(29, 76, 140, 0.3)"
                    }}
                    transition={{ repeat: Infinity, duration: isMicListening ? 1.2 : 3, ease: "easeInOut" }}
                    className={`h-16 w-16 rounded-full cursor-pointer flex items-center justify-center transition-colors duration-300 relative z-10 ${
                      isCoreOverdrive 
                        ? "bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border border-red-400" 
                        : isMicListening
                        ? "bg-gradient-to-tr from-[#00b0ff] via-[#00e5ff] to-[#00ffcc] border border-cyan-300"
                        : "bg-gradient-to-tr from-[#0b1b36] via-[#102b5c] to-[#1e4e94] border border-[#3bc0ff]/40"
                    }`}
                  >
                    {isMicListening ? (
                      <Mic className="h-6 w-6 text-slate-950 animate-bounce" />
                    ) : isCoreOverdrive ? (
                      <Flame className="h-6 w-6 text-slate-950 animate-pulse" />
                    ) : (
                      <Cpu className="h-6 w-6 text-cyan-400 animate-pulse" />
                    )}
                  </motion.div>
                </div>

                {/* Vocal state / text transcript */}
                <div className="mt-3 text-center w-full px-4">
                  <div className="text-[7px] text-[#4ea0ff] uppercase tracking-widest font-bold mb-0.5 select-none">
                    Vocal Synthesis Interface
                  </div>
                  <div className={`text-[10px] font-black tracking-wide min-h-[14px] truncate transition-colors ${
                    isMicListening ? "text-cyan-400" : isCoreOverdrive ? "text-amber-400" : "text-[#9fcfff]/90"
                  }`}>
                    {transcript}
                  </div>
                </div>
              </div>

              {/* Futuristic Widget quick indicators block */}
              <div className="grid grid-cols-4 gap-2 py-2 border-t border-b border-[#14325c]/30">
                <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#09152b] border border-[#14325c]/50">
                  <span className="text-[7px] text-[#5e7ea8] font-bold uppercase mb-0.5">Rating</span>
                  <span className="text-[10px] font-black text-[#3bc0ff]">{sysRating.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#09152b] border border-[#14325c]/50">
                  <span className="text-[7px] text-[#5e7ea8] font-bold uppercase mb-0.5">Thermal</span>
                  <span className={`text-[10px] font-black ${coreTemp > 42 ? "text-red-400" : "text-amber-400"}`}>{coreTemp.toFixed(1)}°C</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#09152b] border border-[#14325c]/50">
                  <span className="text-[7px] text-[#5e7ea8] font-bold uppercase mb-0.5">RAM heap</span>
                  <span className="text-[10px] font-black text-emerald-400">{ramUsage}MB</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#09152b] border border-[#14325c]/50">
                  <span className="text-[7px] text-[#5e7ea8] font-bold uppercase mb-0.5">Room DB</span>
                  <span className="text-[10px] font-black text-[#00ffcc]">12 Recs</span>
                </div>
              </div>

              {/* Simulated OS Settings Toggle Hub */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="text-[7px] text-[#3bc0ff] font-bold uppercase tracking-wider select-none">
                  Stark System Controllers
                </div>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Shield button */}
                  <button
                    onClick={toggleShield}
                    className={`p-2 rounded border text-left flex items-center justify-between transition-all ${
                      isShieldOn 
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400" 
                        : "bg-[#0b1324] border-[#14325c]/50 text-[#5e7ea8] hover:border-[#1e4e94]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                      <Shield className="h-3 w-3 shrink-0" />
                      <span>Security Shield</span>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${isShieldOn ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-[#14325c]"}`} />
                  </button>

                  {/* Overdrive button */}
                  <button
                    onClick={toggleCoreOverdrive}
                    className={`p-2 rounded border text-left flex items-center justify-between transition-all ${
                      isCoreOverdrive 
                        ? "bg-red-950/20 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                        : "bg-[#0b1324] border-[#14325c]/50 text-[#5e7ea8] hover:border-[#1e4e94]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                      <Zap className="h-3 w-3 shrink-0" />
                      <span>AI Overdrive</span>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${isCoreOverdrive ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-[#14325c]"}`} />
                  </button>
                </div>

                {/* Optimize device Action bar */}
                <button
                  disabled={optimizationProgress !== null}
                  onClick={runDeviceOptimization}
                  className="w-full mt-1 p-2 rounded bg-gradient-to-r from-[#0d2242] to-[#12315e] hover:from-[#13305c] hover:to-[#1e4d8f] border border-[#3bc0ff]/40 text-[9px] font-black text-cyan-300 uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative overflow-hidden"
                >
                  {optimizationProgress !== null ? (
                    <div className="absolute inset-y-0 left-0 bg-[#3bc0ff]/20" style={{ width: `${optimizationProgress}%` }} />
                  ) : null}
                  <RefreshCw className={`h-3 w-3 ${optimizationProgress !== null ? "animate-spin text-cyan-400" : "text-cyan-400"}`} />
                  <span>
                    {optimizationProgress !== null ? `OPTIMIZING MATRIX (${optimizationProgress}%)` : "PERFORM DEVICE CORE SWEEP"}
                  </span>
                </button>
              </div>

              {/* Dynamic scrolling Android Logcat output inside phone screen */}
              <div className="mt-3 bg-[#03060c] border border-[#14325c]/40 rounded-lg p-2 flex flex-col flex-1 max-h-[135px] overflow-hidden select-text">
                <div className="flex items-center justify-between text-[7px] text-[#4ea0ff] font-black uppercase tracking-wider pb-1 mb-1 border-b border-[#14325c]/20">
                  <div className="flex items-center gap-1">
                    <Radio className="h-2 w-2 text-[#00ffcc] animate-pulse" />
                    <span>STARK LOGCAT (LIVE INFERENCE STREAM)</span>
                  </div>
                  <span>DEVICE ONLY</span>
                </div>
                
                <div 
                  ref={logTerminalRef}
                  className="flex-1 overflow-y-auto font-mono text-[7px] text-[#4cb3ff] space-y-1 custom-scrollbar leading-relaxed scroll-smooth"
                >
                  {simulatedLogs.map((log, i) => {
                    let color = "text-cyan-400/90";
                    if (log.startsWith("W/")) color = "text-amber-400";
                    if (log.startsWith("E/")) color = "text-red-400";
                    if (log.includes("Optimizer")) color = "text-emerald-400";
                    if (log.includes("Gemini")) color = "text-[#00ffcc]";
                    return (
                      <div key={i} className={`truncate ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: File Selection & Clean Code Viewer */}
        <div className="xl:col-span-7 flex flex-col gap-3 min-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden h-full items-stretch">
            
            {/* File Selector Tab Menu (md:col-span-4) */}
            <div className="md:col-span-5 flex flex-col gap-1.5 overflow-y-auto max-h-[140px] md:max-h-none pr-1 custom-scrollbar select-none">
              <div className="text-[8px] text-[#3bc0ff] font-bold uppercase px-1 pb-1 tracking-wider border-b border-[#14325c]/30 mb-1">
                SOURCE COMPONENT FILES
              </div>
              
              {ANDROID_FILES.map((file, idx) => {
                const IconComponent = file.icon;
                const isSelected = selectedFileIdx === idx;
                return (
                  <button
                    key={file.name}
                    onClick={() => handleSelectFile(idx)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all border flex flex-col gap-1 ${
                      isSelected 
                        ? "bg-[#0c1f40] border-[#3bc0ff] text-[#e2f1ff] shadow-[0_0_10px_rgba(59,192,255,0.1)]" 
                        : "bg-[#050b18] border-[#14325c]/40 text-[#5e7ea8] hover:border-[#3bc0ff]/40 hover:text-[#8ba7d4]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wide">
                      <IconComponent className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-cyan-400 animate-pulse" : "text-[#31507d]"}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="text-[7.5px] leading-normal text-[#4d6a94] overflow-hidden text-ellipsis line-clamp-2">
                      {file.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Code Reader Viewport (md:col-span-8) */}
            <div className="md:col-span-7 bg-[#03060c] border border-[#16305a]/60 rounded-xl p-3 flex flex-col justify-between overflow-hidden relative min-h-[380px] md:min-h-0">
              
              <div className="absolute top-2.5 right-2.5 z-10 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-md bg-[#081224] hover:bg-[#12284c] border border-[#1d4c8c] text-[8px] font-black text-[#00ffcc] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3 w-3" />
                      COPY SOURCE
                    </>
                  )}
                </button>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 overflow-y-auto mb-3 font-mono text-[9px] text-cyan-300/90 leading-relaxed pr-1.5 custom-scrollbar">
                <div className="text-[8px] text-[#4d6a94] font-bold uppercase mb-2.5 pb-2 border-b border-[#14325c]/30 flex items-center gap-1.5 select-none">
                  <Terminal className="h-3.5 w-3.5 text-[#3bc0ff]" />
                  <span>{currentFile.name} &bull; {currentFile.lang.toUpperCase()} VIEWPORT</span>
                </div>
                <pre className="whitespace-pre-wrap select-text selection:bg-[#1d4c8c] selection:text-[#ffffff] pr-2">
                  {currentFile.code}
                </pre>
              </div>

              {/* Context Advisory block */}
              <div className="p-2.5 bg-[#071124] border border-[#1d4c8c]/50 rounded-lg text-[8.5px] text-[#5e7ea8] flex gap-2 items-start select-none">
                <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-cyan-400 font-bold uppercase tracking-wider block mb-0.5">
                    Developer Directive:
                  </span>
                  This represents optimized, production-ready Android core layout components for integration inside Android Studio. Use the copy button above to deploy straight into your native Kotlin workspace.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
