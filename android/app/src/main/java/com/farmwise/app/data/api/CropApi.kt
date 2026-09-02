package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface CropApi {
    @GET("crops") suspend fun listCrops(@Query("name") name: String? = null): ApiEnvelope<List<CropDto>>
    @GET("farms/{farmId}/crops") suspend fun listCycles(@Path("farmId") farmId: String, @Query("fieldId") fieldId: String? = null, @Query("status") status: String? = null): ApiEnvelope<List<CropCycleDto>>
    @GET("farms/{farmId}/crops/{cropCycleId}") suspend fun getCycle(@Path("farmId") farmId: String, @Path("cropCycleId") cycleId: String): ApiEnvelope<CropCycleDto>
    @POST("farms/{farmId}/crops") suspend fun createCycle(@Path("farmId") farmId: String, @Body request: CreateCropCycleRequest): ApiEnvelope<CropCycleDto>
    @GET("farms/{farmId}/crops/{cropCycleId}/activities") suspend fun listActivities(@Path("farmId") farmId: String, @Path("cropCycleId") cycleId: String): ApiEnvelope<List<CropActivityDto>>
    @POST("farms/{farmId}/crops/{cropCycleId}/activities") suspend fun createActivity(@Path("farmId") farmId: String, @Path("cropCycleId") cycleId: String, @Body request: CreateCropActivityRequest): ApiEnvelope<CropActivityDto>
    @GET("farms/{farmId}/crops/{cropCycleId}/inputs") suspend fun listInputs(@Path("farmId") farmId: String, @Path("cropCycleId") cycleId: String): ApiEnvelope<List<CropInputDto>>
    @GET("farms/{farmId}/production") suspend fun listProduction(@Path("farmId") farmId: String): ApiEnvelope<List<ProductionRecordDto>>
    @GET("farms/{farmId}/harvests") suspend fun listHarvests(@Path("farmId") farmId: String, @Query("cropCycleId") cycleId: String? = null): ApiEnvelope<List<HarvestDto>>
    @POST("farms/{farmId}/production") suspend fun createProduction(@Path("farmId") farmId: String, @Body request: CreateProductionRequest): ApiEnvelope<ProductionRecordDto>
    @POST("farms/{farmId}/harvests") suspend fun createHarvest(@Path("farmId") farmId: String, @Body request: CreateHarvestRequest): ApiEnvelope<HarvestDto>
}
