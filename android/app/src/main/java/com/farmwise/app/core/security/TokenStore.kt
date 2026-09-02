package com.farmwise.app.core.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class TokenStore(context: Context) {
    private val preferences = EncryptedSharedPreferences.create(
        context,
        "farmwise_secure_session",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    var accessToken: String?
        get() = preferences.getString("access_token", null)
        private set(value) = preferences.edit().putString("access_token", value).apply()

    var refreshToken: String?
        get() = preferences.getString("refresh_token", null)
        private set(value) = preferences.edit().putString("refresh_token", value).apply()

    fun save(accessToken: String, refreshToken: String?) {
        this.accessToken = accessToken
        if (refreshToken != null) this.refreshToken = refreshToken
    }

    fun clear() = preferences.edit().clear().apply()
}
