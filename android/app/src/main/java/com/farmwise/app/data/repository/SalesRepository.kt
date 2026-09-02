package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.SalesApi
import com.farmwise.app.data.models.*

class SalesRepository(private val api: SalesApi, private val context: FarmContextStore) {
    private fun farmId(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun list(status: String? = null): Result<List<SaleDto>> = runCatching { api.list(farmId(), status).data ?: emptyList() }
    suspend fun create(request: CreateSaleRequest): Result<SaleDto> = runCatching { api.create(farmId(), request).data ?: error("Sale creation failed") }
}
