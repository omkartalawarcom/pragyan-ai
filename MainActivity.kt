package com.pragyan.ai

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.net.Uri
import android.os.Bundle
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private val RECORD_AUDIO_REQUEST_CODE = 101

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.pragyanWebView)

        // Request audio permissions for Pragyan Voice Assistant
        checkAudioPermissions()

        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.allowFileAccess = true
        webSettings.mediaPlaybackRequiresUserGesture = false
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        // Register genuine Android Automation Bridge
        webView.addJavascriptInterface(AndroidAutomationBridge(this), "AndroidAutomation")

        // Load Pragyan AI server
        val backendUrl = getString(R.string.pragyan_backend_url)
        webView.loadUrl(backendUrl)
    }

    private fun checkAudioPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.MODIFY_AUDIO_SETTINGS),
                RECORD_AUDIO_REQUEST_CODE
            )
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    /**
     * Genuine Android Phone Automation Bridge
     */
    inner class AndroidAutomationBridge(private val context: Context) {

        @JavascriptInterface
        fun openYouTube() {
            runOnUiThread {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube:"))
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                } catch (e: Exception) {
                    val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com"))
                    webIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(webIntent)
                }
            }
        }

        @JavascriptInterface
        fun openWhatsApp() {
            runOnUiThread {
                try {
                    val intent = context.packageManager.getLaunchIntentForPackage("com.whatsapp")
                    if (intent != null) {
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(intent)
                    } else {
                        val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com"))
                        webIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        context.startActivity(webIntent)
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "WhatsApp is not installed.", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun openCamera() {
            runOnUiThread {
                try {
                    val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "Could not open camera: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun openSettings() {
            runOnUiThread {
                val intent = Intent(Settings.ACTION_SETTINGS)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }

        @JavascriptInterface
        fun openWifiSettings() {
            runOnUiThread {
                val intent = Intent(Settings.ACTION_WIFI_SETTINGS)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }

        @JavascriptInterface
        fun openBluetoothSettings() {
            runOnUiThread {
                val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }

        @JavascriptInterface
        fun setAlarm(hour: Int, minute: Int, message: String) {
            runOnUiThread {
                try {
                    val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                        putExtra(AlarmClock.EXTRA_HOUR, hour)
                        putExtra(AlarmClock.EXTRA_MINUTES, minute)
                        putExtra(AlarmClock.EXTRA_MESSAGE, message)
                        putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                    }
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "Alarm set failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun adjustVolume(increase: Boolean) {
            runOnUiThread {
                val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                val direction = if (increase) AudioManager.ADJUST_RAISE else AudioManager.ADJUST_LOWER
                audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, direction, AudioManager.FLAG_SHOW_UI)
            }
        }

        @JavascriptInterface
        fun scrollDown() {
            runOnUiThread {
                PragyanAccessibilityService.instance?.scrollDown()
            }
        }

        @JavascriptInterface
        fun scrollUp() {
            runOnUiThread {
                PragyanAccessibilityService.instance?.scrollUp()
            }
        }

        @JavascriptInterface
        fun navigateBack() {
            runOnUiThread {
                val handled = PragyanAccessibilityService.instance?.performGoBack() ?: false
                if (!handled) {
                    onBackPressed()
                }
            }
        }

        @JavascriptInterface
        fun makeCall(phoneNumber: String) {
            runOnUiThread {
                val intent = Intent(Intent.ACTION_DIAL).apply {
                    data = Uri.parse("tel:$phoneNumber")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            }
        }

        @JavascriptInterface
        fun requestAccessibilityPermission() {
            runOnUiThread {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }
    }
}
