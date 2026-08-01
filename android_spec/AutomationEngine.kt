package com.jarvis.lite.automation

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.NetworkInfo
import android.net.wifi.WifiManager
import com.jarvis.lite.data.local.AutomationRoutine
import com.jarvis.lite.data.local.JervisDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class TriggerReceiver : BroadcastReceiver() {

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val database = JervisDatabase.getDatabase(context)
        val action = intent.action ?: return

        scope.launch {
            val activeRoutines = database.automationDao().getActiveRoutines().first()
            
            for (routine in activeRoutines) {
                if (matchesTrigger(routine.trigger, action, intent)) {
                    executeRoutineAction(context, routine)
                }
            }
        }
    }

    private fun matchesTrigger(trigger: String, action: String, intent: Intent): Boolean {
        return when (trigger.lowercase()) {
            "power_connected" -> action == Intent.ACTION_POWER_CONNECTED
            "power_disconnected" -> action == Intent.ACTION_POWER_DISCONNECTED
            "wifi_changed" -> action == WifiManager.NETWORK_STATE_CHANGED_ACTION
            "boot_completed" -> action == Intent.ACTION_BOOT_COMPLETED
            else -> false
        }
    }

    private fun executeRoutineAction(context: Context, routine: AutomationRoutine) {
        // Fire broadcast to ViewModel to speak the action or run it directly
        val executionIntent = Intent("com.jarvis.lite.EXECUTE_ACTION").apply {
            putExtra("routine_name", routine.name)
            putExtra("action_protocol", routine.action)
        }
        context.sendBroadcast(executionIntent)
    }
}

class RoutineEvaluator(private val context: Context) {
    
    fun evaluateIfThenElse(condition: String, positiveAction: String, negativeAction: String, variableValue: String) {
        if (variableValue.contains(condition, ignoreCase = true)) {
            dispatchAction(positiveAction)
        } else {
            dispatchAction(negativeAction)
        }
    }

    private fun dispatchAction(actionProtocol: String) {
        val intent = Intent("com.jarvis.lite.EXECUTE_ACTION").apply {
            putExtra("action_protocol", actionProtocol)
        }
        context.sendBroadcast(intent)
    }
}
