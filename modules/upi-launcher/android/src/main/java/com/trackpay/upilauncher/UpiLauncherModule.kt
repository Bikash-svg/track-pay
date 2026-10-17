package com.trackpay.upilauncher

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.events.OnActivityResultPayload
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val REQUEST_CODE_UPI = 1001

class UpiLauncherModule : Module() {

  private var pendingPromise: Promise? = null

  private fun queryApps(packageManager: PackageManager, flags: Int): List<Map<String, Any>> {
    val intent = Intent(Intent.ACTION_VIEW).setData(Uri.parse("upi://pay"))
    val resolveInfos = packageManager.queryIntentActivities(intent, flags)
    val apps = mutableListOf<Map<String, Any>>()
    resolveInfos.forEach { resolveInfo ->
      resolveInfo.activityInfo?.applicationInfo?.let { appInfo ->
        apps += mapOf(
          "packageName" to appInfo.packageName,
          "label" to resolveInfo.loadLabel(packageManager).toString()
        )
      }
    }
    return apps
  }

  override fun definition() = ModuleDefinition {
    Name("UpiLauncher")

    AsyncFunction("openUpi") { link: String, packageName: String?, promise: Promise ->
      pendingPromise = promise
      val intent = Intent(Intent.ACTION_VIEW).apply {
        data = Uri.parse(link)
        if (packageName?.isNotEmpty() == true) setPackage(packageName)
      }
      val activity = appContext.currentActivity
        ?: run {
          pendingPromise = null
          promise.reject("NO_ACTIVITY", "No current activity", null)
          return@AsyncFunction
        }
      try {
        activity.startActivityForResult(intent, REQUEST_CODE_UPI)
      } catch (e: Exception) {
        pendingPromise = null
        promise.reject("OPEN_FAILED", e.message ?: "Unknown error", e)
      }
    }

    AsyncFunction("listUpiApps") { promise: Promise ->
      val reactContext = appContext.reactContext
        ?: run {
          promise.reject("NO_CONTEXT", "No react context", null)
          return@AsyncFunction
        }
      val packageManager = reactContext.packageManager
      val matchDefaultApps = queryApps(packageManager, PackageManager.MATCH_DEFAULT_ONLY)
      val flagsZeroApps = queryApps(packageManager, 0)
      promise.resolve(mapOf(
        "sdkInt" to Build.VERSION.SDK_INT,
        "matchDefaultOnly" to mapOf("flags" to PackageManager.MATCH_DEFAULT_ONLY, "count" to matchDefaultApps.size, "apps" to matchDefaultApps),
        "flagsZero" to mapOf("flags" to 0, "count" to flagsZeroApps.size, "apps" to flagsZeroApps),
      ))
    }

    Events("UpiLauncherEvent")
    OnActivityResult { _, payload ->
      if (payload.requestCode == REQUEST_CODE_UPI) {
        pendingPromise?.let { promise ->
          val map = mutableMapOf<String, Any?>()
          map["action"] = payload.data?.action
          map["data"] = payload.data?.data?.toString()
          val extras = payload.data?.extras?.keySet()?.map { key ->
            "$key=${payload.data?.extras?.get(key)}"
          }?.joinToString(", ") ?: "none"
          map["extras"] = extras
          promise.resolve(map)
          pendingPromise = null
        }
      }
    }
  }
}
