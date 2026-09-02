package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface ActivityApi {
    @GET("farms/{farmId}/activity-types") suspend fun types(@Path("farmId") farmId: String): ApiEnvelope<List<ActivityTypeDto>>
    @GET("farms/{farmId}/activities") suspend fun list(@Path("farmId") farmId: String, @Query("status") status: String? = null, @Query("category") category: String? = null, @Query("assigneeId") assigneeId: String? = null): ApiEnvelope<List<FarmActivityDto>>
    @GET("farms/{farmId}/activities/{activityId}") suspend fun get(@Path("farmId") farmId: String, @Path("activityId") activityId: String): ApiEnvelope<FarmActivityDto>
    @POST("farms/{farmId}/activities") suspend fun create(@Path("farmId") farmId: String, @Body request: CreateActivityRequest): ApiEnvelope<FarmActivityDto>
}
