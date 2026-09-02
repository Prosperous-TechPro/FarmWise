package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login") suspend fun login(@Body request: LoginRequest): ApiEnvelope<LoginData>
    @POST("auth/register") suspend fun register(@Body request: RegisterRequest): ApiEnvelope<Map<String, Any>>
    @POST("auth/verify-otp") suspend fun verifyOtp(@Body request: OtpRequest): ApiEnvelope<Any>
    @POST("auth/refresh") suspend fun refresh(@Body body: Map<String, String>): ApiEnvelope<LoginData>
    @POST("auth/logout") suspend fun logout(): ApiEnvelope<Any>
}
