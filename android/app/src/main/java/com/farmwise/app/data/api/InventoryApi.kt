package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.*

interface InventoryApi {
    @GET("farms/{farmId}/inventory/summary") suspend fun summary(@Path("farmId") farmId: String): ApiEnvelope<InventorySummaryDto>
    @GET("farms/{farmId}/inventory/items") suspend fun items(@Path("farmId") farmId: String, @Query("search") search: String? = null, @Query("category") category: String? = null, @Query("isActive") isActive: Boolean? = true): ApiEnvelope<List<InventoryItemDto>>
    @POST("farms/{farmId}/inventory/items") suspend fun createItem(@Path("farmId") farmId: String, @Body request: CreateInventoryItemRequest): ApiEnvelope<InventoryItemDto>
    @GET("farms/{farmId}/inventory/locations") suspend fun locations(@Path("farmId") farmId: String): ApiEnvelope<List<StorageLocationDto>>
    @GET("farms/{farmId}/inventory/receipts") suspend fun receipts(@Path("farmId") farmId: String, @Query("itemId") itemId: String? = null): ApiEnvelope<List<InventoryReceiptDto>>
    @POST("farms/{farmId}/inventory/receipts") suspend fun receive(@Path("farmId") farmId: String, @Body request: ReceiveInventoryRequest): ApiEnvelope<InventoryReceiptDto>
    @GET("farms/{farmId}/inventory/issues") suspend fun issues(@Path("farmId") farmId: String, @Query("itemId") itemId: String? = null): ApiEnvelope<List<InventoryIssueDto>>
    @POST("farms/{farmId}/inventory/issues") suspend fun issue(@Path("farmId") farmId: String, @Body request: IssueInventoryRequest): ApiEnvelope<InventoryIssueDto>
}
