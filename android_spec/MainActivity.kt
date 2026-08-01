package com.jarvis.lite

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.animation.AnimatedVisibility
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
                        // Display the cryptographic biometric/PIN validation overlay
                        SecurityLockScreen(
                            onPinEntered = { enteredPin ->
                                if (securityViewModel.verifyPin(enteredPin)) {
                                    Toast.makeText(this, "Welcome back, Sir.", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(this, "Access Denied! Security mismatch.", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onBiometricRequested = {
                                triggerBiometricPrompt()
                            }
                        )
                    } else {
                        // Display the Main JARVIS Dashboard & Interactive AI Orb
                        DashboardScreen(
                            viewModel = viewModel,
                            onToggleVoice = { viewModel.toggleContinuousListening() },
                            onToggleFlashlight = { viewModel.toggleFlashlight(this) }
                        )
                    }
                }
            }
        }

        // Trigger biometrics automatically if PIN configuration & sensor are ready
        if (securityViewModel.isBiometricReady(this)) {
            triggerBiometricPrompt()
        }
    }

    private fun setupBiometrics() {
        biometricPrompt = BiometricPrompt(this, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    securityViewModel.logSystemEvent("Biometric failure or cancelled: $errString", isError = true)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    securityViewModel.unlockApp()
                    viewModel.synthesizeGreeting("Access granted. Welcome back, Sir.")
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    securityViewModel.logSystemEvent("Identity match failed", isError = true)
                }
            })

        promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("JARVIS Authorization Protocol")
            .setSubtitle("Confirm biological sign to unlock HUD")
            .setNegativeButtonText("Use PIN Backup")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build()
    }

    private fun triggerBiometricPrompt() {
        try {
            biometricPrompt.authenticate(promptInfo)
        } catch (e: Exception) {
            securityViewModel.logSystemEvent("Biometric session error: ${e.message}", isError = true)
        }
    }
}
