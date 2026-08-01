package com.jarvis.lite.services

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

        // Ignore system notifications or self-notifications
        if (packageName == "com.jarvis.lite" || packageName == "android") return

        Log.d(TAG, "Notification Captured >> App: $packageName | Title: $title | Content: $text")

        scope.launch {
            // 1. Persist notification record into encrypted database memory
            val memoryRecord = MemoryRecord(
                key = "notification_$packageName",
                value = "Title: $title | Message: $text | Sub: $subText",
                category = "notification_history",
                timestamp = System.currentTimeMillis()
            )
            database.memoryDao().insertMemory(memoryRecord)

            // 2. Evaluate Smart Reply Suggestions / Automated Broadcast Triggers
            evaluateNotificationTriggers(packageName, title, text)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        Log.d(TAG, "Notification Dismissed from tray: ${sbn.packageName}")
    }

    private fun evaluateNotificationTriggers(packageName: String, title: String, text: String) {
        // Trigger automated responses or broadcasts based on content
        if (packageName.contains("whatsapp") || packageName.contains("telegrams")) {
            if (text.lowercase().contains("emergency") || text.lowercase().contains("urgent")) {
                Log.w(TAG, "Urgent message detected! Triggering system priority broadcast.")
                val intent = Intent("com.jarvis.lite.EXECUTE_ACTION").apply {
                    putExtra("action_protocol", "speak_greeting")
                    putExtra("vocal_override", "Sir, an urgent message from $title has arrived: $text")
                }
                sendBroadcast(intent)
            }
        }
    }
}
