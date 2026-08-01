package com.jarvis.lite.services

import android.accessibilityservice.AccessibilityService
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.view.accessibility.AccessibilityEvent
import androidx.core.app.NotificationCompat
import com.jarvis.lite.MainActivity
import com.jarvis.lite.voice.SpeechToTextManager

class ForegroundVoiceService : Service() {

    private var speechToTextManager: SpeechToTextManager? = null
    private val CHANNEL_ID = "JarvisVoiceServiceChannel"
    private val NOTIFICATION_ID = 8808

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Build sticky system foreground notifications for uninterrupted operations
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("JARVIS AI Active")
            .setContentText("Hands-free vocal hotword listener is online")
            .setSmallIcon(android.R.drawable.presence_micro_phone)
            .setContentIntent(pendingIntent)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        // Initialize background hotword pipeline
        initializeSpeechManager()

        return START_STICKY
    }

    private fun initializeSpeechManager() {
        speechToTextManager = SpeechToTextManager(this,
            onResult = { query ->
                // Fire action command broadcast to system and local memory
                val broadcastIntent = Intent("com.jarvis.lite.VOICE_COMMAND").apply {
                    putExtra("command_payload", query)
                }
                sendBroadcast(broadcastIntent)
            },
            onError = { error ->
                // Log and gracefully reset wake-word recognizer thread
                speechToTextManager?.startListening()
            }
        )
        speechToTextManager?.startListening()
    }

    override fun onDestroy() {
        speechToTextManager?.destroy()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "JARVIS Background Services",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }
}

class AssistantAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Track visual context for proactive suggestions or smart OCR replies
    }

    override fun onInterrupt() {}

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Access permissions confirmed by user. Register accessibility routing
    }

    fun executeSystemCommand(command: String): Boolean {
        return when (command.lowercase().trim()) {
            "go home" -> {
                performGlobalAction(GLOBAL_ACTION_HOME)
                true
            }
            "back" -> {
                performGlobalAction(GLOBAL_ACTION_BACK)
                true
            }
            "recents" -> {
                performGlobalAction(GLOBAL_ACTION_RECENTS)
                true
            }
            "notifications" -> {
                performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
                true
            }
            "lock screen" -> {
                performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
                true
            }
            else -> false
        }
    }
}
