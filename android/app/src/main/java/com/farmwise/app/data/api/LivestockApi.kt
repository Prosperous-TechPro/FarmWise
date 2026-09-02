package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface LivestockApi {
    @GET("farms/{farmId}/livestock") suspend fun list(@Path("farmId") farmId: String, @Query("sex") sex: String? = null, @Query("status") status: String? = null, @Query("tagNumber") tagNumber: String? = null): ApiEnvelope<List<LivestockDto>>
    @GET("farms/{farmId}/livestock/{livestockId}") suspend fun get(@Path("farmId") farmId: String, @Path("livestockId") livestockId: String): ApiEnvelope<LivestockDto>
    @POST("farms/{farmId}/livestock") suspend fun create(@Path("farmId") farmId: String, @Body request: CreateLivestockRequest): ApiEnvelope<LivestockDto>
    @PUT("farms/{farmId}/livestock/{livestockId}") suspend fun update(@Path("farmId") farmId: String, @Path("livestockId") livestockId: String, @Body request: CreateLivestockRequest): ApiEnvelope<LivestockDto>
    @GET("livestock/species") suspend fun species(): ApiEnvelope<List<LivestockSpeciesDto>>
    @GET("livestock/breeds") suspend fun breeds(@Query("speciesId") speciesId: String): ApiEnvelope<List<LivestockBreedDto>>
    @GET("farms/{farmId}/livestock/{livestockId}/breeding") suspend fun breeding(@Path("farmId") farmId: String, @Path("livestockId") livestockId: String): ApiEnvelope<List<BreedingDto>>
    @POST("farms/{farmId}/livestock/{livestockId}/breeding") suspend fun createBreeding(@Path("farmId") farmId: String, @Path("livestockId") livestockId: String, @Body request: CreateBreedingRequest): ApiEnvelope<BreedingDto>
}
