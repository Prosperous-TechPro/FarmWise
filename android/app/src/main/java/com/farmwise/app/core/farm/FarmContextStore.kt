package com.farmwise.app.core.farm

import android.content.Context

class FarmContextStore(context: Context) {
    private val preferences = context.getSharedPreferences("farmwise_farm_context", Context.MODE_PRIVATE)

    var currentFarmId: String?
        get() = preferences.getString("current_farm_id", null)
        set(value) {
            preferences.edit().putString("current_farm_id", value).apply()
        }

    fun clear() = preferences.edit().clear().apply()
}
