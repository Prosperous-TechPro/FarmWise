package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface FieldApi {
    @GET("farms/{farmId}/fields") suspend fun list(@Path("farmId") farmId: String): ApiEnvelope<List<FieldDto>>
    @GET("farms/{farmId}/fields/{fieldId}") suspend fun get(@Path("farmId") farmId: String, @Path("fieldId") fieldId: String): ApiEnvelope<FieldDto>
    @POST("farms/{farmId}/fields") suspend fun create(@Path("farmId") farmId: String, @Body request: CreateFieldRequest): ApiEnvelope<FieldDto>
    @PUT("farms/{farmId}/fields/{fieldId}") suspend fun update(@Path("farmId") farmId: String, @Path("fieldId") fieldId: String, @Body request: UpdateFieldRequest): ApiEnvelope<FieldDto>
}
