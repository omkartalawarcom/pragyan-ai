import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Code, 
  FileText, 
  Terminal, 
  Layers, 
  ExternalLink,
  Smartphone,
  Cpu
} from 'lucide-react';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'guide' | 'mainactivity' | 'manifest' | 'gradle' | 'backend'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const mainActivityCode = `package com.pragyan.ai

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
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

        // Request Audio/Microphone permission for Pragyan Voice Assistant
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
            // Automatically grant webview audio permissions for microphone
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        // Load Pragyan AI Full Stack Endpoint
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
}`;

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.pragyan.ai">

    <!-- Permissions required for Pragyan AI -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PragyanAI"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.PragyanAI.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const gradleCode = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.pragyan.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.pragyan.ai"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.webkit:webkit:1.10.0")
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <PragyanRobotLogo size={36} />
            <div>
              <h3 className="font-bold text-base tracking-tight">Android APK Build Package</h3>
              <p className="text-xs text-slate-400">Complete native Android source files & APK generation instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className={`px-4 pt-3 flex items-center gap-2 border-b overflow-x-auto text-xs ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}>
          {[
            { id: 'guide', label: '1-Click Build Guide' },
            { id: 'mainactivity', label: 'MainActivity.kt' },
            { id: 'manifest', label: 'AndroidManifest.xml' },
            { id: 'gradle', label: 'build.gradle.kts' },
            { id: 'backend', label: 'Backend Architecture' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 border-b-2 font-medium shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs sm:text-sm space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <h4 className="font-bold text-sm text-blue-400 mb-2">How to build the Pragyan AI Android APK:</h4>
                <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-300">
                  <li>
                    <strong>Open Android Studio</strong> &rarr; Click <em>"Open"</em> and select the <code>/android</code> directory from this project.
                  </li>
                  <li>
                    <strong>Automatic Sync</strong>: Gradle will automatically resolve the dependencies (AndroidX, WebKit, Material 3).
                  </li>
                  <li>
                    <strong>Build APK</strong>: Go to <strong>Build</strong> &rarr; <strong>Build Bundle(s) / APK(s)</strong> &rarr; <strong>Build APK(s)</strong>.
                  </li>
                  <li>
                    <strong>Install on Android Phone</strong>: Android Studio generates <code>app-debug.apk</code> in <code>android/app/build/outputs/apk/debug/</code>. Transfer it to your phone or connect your phone via USB and click <strong>Run (Shift+F10)</strong>.
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <span className="font-bold block text-xs">Terminal / CLI Build Command:</span>
                <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs flex items-center justify-between">
                  <span>cd android && ./gradlew assembleDebug</span>
                  <button
                    onClick={() => copyCode('cmd', 'cd android && ./gradlew assembleDebug')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'cmd' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-1">
                <span className="font-bold text-slate-200 block">All Features Native & Ready:</span>
                <p>• Microphone permissions are pre-configured in AndroidManifest for hands-free speech recognition.</p>
                <p>• Offline caching is supported via DOM storage and database cache.</p>
                <p>• Free tier Gemini models are executed server-side so no API keys are ever bundled inside the APK binary.</p>
              </div>
            </div>
          )}

          {activeTab === 'mainactivity' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">android/app/src/main/java/com/pragyan/ai/MainActivity.kt</span>
                <button
                  onClick={() => copyCode('mainactivity', mainActivityCode)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'mainactivity' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'mainactivity' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {mainActivityCode}
              </pre>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">android/app/src/main/AndroidManifest.xml</span>
                <button
                  onClick={() => copyCode('manifest', manifestCode)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'manifest' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {manifestCode}
              </pre>
            </div>
          )}

          {activeTab === 'gradle' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">android/app/build.gradle.kts</span>
                <button
                  onClick={() => copyCode('gradle', gradleCode)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'gradle' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {gradleCode}
              </pre>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-indigo-400">Pragyan AI Backend Architecture</h4>
              <p className="text-xs leading-relaxed text-slate-300">
                The backend service runs in <code>server.ts</code> using Express and the official Google GenAI SDK (<code>@google/genai</code>).
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-200 block">Key Endpoints Provided:</span>
                <p>• <code>POST /api/chat</code> &rarr; General Multi-turn AI Assistant</p>
                <p>• <code>POST /api/voice/process</code> &rarr; Natural Audio Response Engine</p>
                <p>• <code>POST /api/pdf/analyze</code> &rarr; PDF Multimodal Document QA & Summarizer</p>
                <p>• <code>POST /api/study-plan</code> &rarr; Algorithmic Timetable Architect</p>
                <p>• <code>POST /api/notes/summarize</code> &rarr; Structured Exam Guide Generator</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-end ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
