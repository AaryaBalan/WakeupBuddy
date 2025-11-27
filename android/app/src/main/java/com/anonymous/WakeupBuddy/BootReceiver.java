package com.anonymous.WakeupBuddy;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action != null && (action.equals(Intent.ACTION_BOOT_COMPLETED) || action.equals("android.intent.action.QUICKBOOT_POWERON"))) {
            Log.i(TAG, "Device rebooted - you should re-schedule alarms here (from persistent storage)");
            // TODO: read persisted alarms and re-schedule them
        }
    }
}
