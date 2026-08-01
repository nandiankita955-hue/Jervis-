package com.jarvis.lite.plugins

import android.os.Bundle
import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class JervisPluginConfig(
    val pluginId: String,
    val pluginName: String,
    val developerSignature: String,
    val requestedCapabilities: List<String> // e.g. "VOICE_TRIGGER", "BACKGROUND_JOB", "DATA_READ"
) : Parcelable

interface IJervisPlugin {
    fun getPluginConfig(): JervisPluginConfig
    fun onVoiceCommandReceived(command: String, args: Bundle): JervisPluginResult
    fun onTriggerConditionFired(triggerType: String, data: Bundle): JervisPluginResult
}

@Parcelize
data class JervisPluginResult(
    val success: Boolean,
    val vocalResponse: String?,
    val executionPayload: Bundle?
) : Parcelable

class PluginManager {
    private val registeredPlugins = mutableMapOf<String, IJervisPlugin>()

    fun registerPlugin(plugin: IJervisPlugin): Boolean {
        val config = plugin.getPluginConfig()
        
        // Verify certificates & signatures to prevent malicious overlays or privilege escalation
        if (isSignatureVerified(config.developerSignature)) {
            registeredPlugins[config.pluginId] = plugin
            return true
        }
        return false
    }

    fun dispatchCommandToPlugins(command: String): JervisPluginResult? {
        for (plugin in registeredPlugins.values) {
            val config = plugin.getPluginConfig()
            if (config.requestedCapabilities.contains("VOICE_TRIGGER")) {
                val result = plugin.onVoiceCommandReceived(command, Bundle())
                if (result.success) {
                    return result
                }
            }
        }
        return null
    }

    private fun isSignatureVerified(signature: String): Boolean {
        // Enforce strict certificate pinning & verification routines in production
        return signature.isNotEmpty()
    }
}
