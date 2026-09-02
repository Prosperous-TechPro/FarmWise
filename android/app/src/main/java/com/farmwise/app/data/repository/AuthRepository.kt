package com.farmwise.app.data.repository

import com.farmwise.app.core.security.TokenStore
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.AuthApi
import com.farmwise.app.data.models.LoginRequest

class AuthRepository(private val api: AuthApi, private val tokenStore: TokenStore, private val farmContextStore: FarmContextStore? = null) {
    suspend fun login(identifier: String, password: String): Result<Boolean> = runCatching {
        val request = if (identifier.contains("@")) LoginRequest(email = identifier, password = password) else LoginRequest(phone = identifier, password = password)
        val response = api.login(request)
        val data = response.data ?: error(response.message ?: "Login failed")
        if (data.requiresTwoFactor) return@runCatching false
        val access = data.accessToken ?: error("No access token returned")
        tokenStore.save(access, data.refreshToken)
        true
    }

    suspend fun logout() {
        runCatching { api.logout() }
        tokenStore.clear()
        farmContextStore?.clear()
    }
}
