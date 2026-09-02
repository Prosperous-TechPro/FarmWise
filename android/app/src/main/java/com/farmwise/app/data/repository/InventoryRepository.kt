package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.InventoryApi
import com.farmwise.app.data.models.*

class InventoryRepository(private val api: InventoryApi, private val context: FarmContextStore) {
    private fun farmId(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun summary(): Result<InventorySummaryDto> = runCatching { api.summary(farmId()).data ?: error("Inventory summary unavailable") }
    suspend fun items(search: String? = null, category: String? = null): Result<List<InventoryItemDto>> = runCatching { api.items(farmId(), search, category).data ?: emptyList() }
    suspend fun locations(): Result<List<StorageLocationDto>> = runCatching { api.locations(farmId()).data ?: emptyList() }
    suspend fun receipts(itemId: String? = null): Result<List<InventoryReceiptDto>> = runCatching { api.receipts(farmId(), itemId).data ?: emptyList() }
    suspend fun issues(itemId: String? = null): Result<List<InventoryIssueDto>> = runCatching { api.issues(farmId(), itemId).data ?: emptyList() }
    suspend fun createItem(request: CreateInventoryItemRequest): Result<InventoryItemDto> = runCatching { api.createItem(farmId(), request).data ?: error("Inventory item creation failed") }
    suspend fun receive(request: ReceiveInventoryRequest): Result<InventoryReceiptDto> = runCatching { api.receive(farmId(), request).data ?: error("Stock receipt failed") }
    suspend fun issue(request: IssueInventoryRequest): Result<InventoryIssueDto> = runCatching { api.issue(farmId(), request).data ?: error("Stock usage failed") }
}
