package com.pragyan.ai

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent

/**
 * Genuine Android AccessibilityService for Pragyan AI.
 * Strictly respects Android user privacy:
 * - Can perform user-requested navigation gestures (scroll up, scroll down, back).
 * - Never monitors personal screen content or retrieves sensitive window data.
 */
class PragyanAccessibilityService : AccessibilityService() {

    companion object {
        var instance: PragyanAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Privacy preserved: No background screen monitoring or surveillance performed
    }

    override fun onInterrupt() {
        // Handle service interruption gracefully
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    /**
     * Perform global back navigation action on behalf of user
     */
    fun performGoBack(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    /**
     * Perform global home action
     */
    fun performGoHome(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_HOME)
    }

    /**
     * Perform smooth scroll down gesture
     */
    fun scrollDown() {
        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels.toFloat()
        val height = displayMetrics.heightPixels.toFloat()

        val startX = width / 2
        val startY = height * 0.75f
        val endY = height * 0.25f

        dispatchSwipeGesture(startX, startY, startX, endY, 300)
    }

    /**
     * Perform smooth scroll up gesture
     */
    fun scrollUp() {
        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels.toFloat()
        val height = displayMetrics.heightPixels.toFloat()

        val startX = width / 2
        val startY = height * 0.25f
        val endY = height * 0.75f

        dispatchSwipeGesture(startX, startY, startX, endY, 300)
    }

    private fun dispatchSwipeGesture(startX: Float, startY: Float, endX: Float, endY: Float, duration: Long) {
        val path = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, duration))
            .build()

        dispatchGesture(gesture, null, null)
    }
}
