package com.trackpay.upilauncher

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.modules.AppArg
import expo.modules.kotlin.modules.dsl._

class UpiLauncherModule : Module() {

  private var pendingPromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("UpiLauncher")

    AsyncFunction("openUpi") { link: String, packageName: String?, promise: Promise ->
      pendingPromise = promise
      val intent = Intent(Intent.ACTION_VIEW).apply {
        data = Uri.parse(link)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        packageName?.let { setPackage(it) }
      }
      val activity = appContext.currentActivity
        ?: run {
          pendingPromise = null
          promise.reject("NO_ACTIVITY", "No current activity")
          return@AsyncFunction
        }
      try {
        activity.startActivityForResult(intent, REQUEST_CODE_UPI)
      } catch (e: Exception) {
        pendingPromise = null
        promise.reject("OPEN_FAILED", e.message ?: "Unknown error")
      }
    }

    Function("listUpiApps") { promise: Promise ->
      val packageManager = appContext.packageManager
      val intent = Intent(Intent.ACTION_VIEW).setData(Uri.parse("upi://pay"))
      val resolveInfos = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
      val apps = mutableListOf<Map<String, Any>>()
      resolveInfos.forEach { resolveInfo ->
        resolveInfo.activityInfo?.applicationInfo?.let { appInfo ->
          apps += mapOf(
            "packageName" to appInfo.packageName,
            "label" to resolveInfo.loadLabel(packageManager).toString()
          )
        }
      }
      promise.resolve(apps)
    }

    Events("UpiLauncherEvent")
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    super.onActivityResult(activity, requestCode, resultCode, data)
    if (requestCode != REQUEST_CODE_UPI) return
    pendingPromise?.let { promise ->
      val map = mutableMapOf<String, Any?>()
      map["action"] = data?.action
      map["data"] = data?.data?.toString()
      map["extras"] = data?.extras?.keySet()?.joinToString(",") ?: "none"
      promise.resolve(map)
      pendingPromise = null
    }
  }

  companion object {
    private const val REQUEST_CODE_UPI = 1001
  }
}
