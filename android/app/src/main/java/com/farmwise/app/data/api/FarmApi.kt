package com.farmwise.app.data.api

import com.farmwise.app.data.models.ApiEnvelope
import com.farmwise.app.data.models.CreateFarmRequest
import com.farmwise.app.data.models.FarmDto
import com.farmwise.app.data.models.UpdateFarmRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface FarmApi {
    @GET("farms") suspend fun listFarms(): ApiEnvelope<List<FarmDto>>
    @GET("farms/{farmId}") suspend fun getFarm(@Path("farmId") farmId: String): ApiEnvelope<FarmDto>
    @POST("farms") suspend fun createFarm(@Body request: CreateFarmRequest): ApiEnvelope<FarmDto>
    @PUT("farms/{farmId}") suspend fun updateFarm(@Path("farmId") farmId: String, @Body request: UpdateFarmRequest): ApiEnvelope<FarmDto>
}
