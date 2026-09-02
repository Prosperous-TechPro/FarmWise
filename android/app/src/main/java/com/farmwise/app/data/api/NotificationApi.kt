package com.farmwise.app.data.api

import com.farmwise.app.data.models.ApiEnvelope
import com.farmwise.app.data.models.NotificationDto
import retrofit2.http.GET
import retrofit2.http.Query

interface NotificationApi {
    @GET("notifications/unread-count") suspend fun unreadCount(@Query("farmId") farmId: String? = null): ApiEnvelope<Map<String, Int>>
    @GET("notifications") suspend fun list(@Query("page") page: Int = 1, @Query("limit") limit: Int = 20): ApiEnvelope<List<NotificationDto>>
}
