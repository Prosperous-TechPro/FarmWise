package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface SalesApi {
    @GET("farms/{farmId}/sales") suspend fun list(@Path("farmId") farmId: String, @Query("status") status: String? = null, @Query("currency") currency: String? = null): ApiEnvelope<List<SaleDto>>
    @POST("farms/{farmId}/sales") suspend fun create(@Path("farmId") farmId: String, @Body request: CreateSaleRequest): ApiEnvelope<SaleDto>
}
