package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.FarmApi
import com.farmwise.app.data.models.CreateFarmRequest
import com.farmwise.app.data.models.FarmDto
import com.farmwise.app.data.models.UpdateFarmRequest

class FarmRepository(private val api: FarmApi, private val contextStore: FarmContextStore) {
    suspend fun list(): Result<List<FarmDto>> = runCatching { api.listFarms().data ?: emptyList() }

    suspend fun get(farmId: String): Result<FarmDto> = runCatching {
        require(farmId.isNotBlank()) { "Please select a farm first." }
        api.getFarm(farmId).data ?: error("This farm is no longer available.")
    }

    suspend fun create(request: CreateFarmRequest): Result<FarmDto> = runCatching {
        api.createFarm(request).data ?: error("Farm creation failed")
    }

    suspend fun update(farmId: String, request: UpdateFarmRequest): Result<FarmDto> = runCatching {
        require(farmId.isNotBlank()) { "Please select a farm first." }
        api.updateFarm(farmId, request).data ?: error("Farm update failed")
    }

    fun select(farm: FarmDto) { contextStore.currentFarmId = farm.id }
    fun clearSelection() { contextStore.clear() }
    fun selectedFarmId(): String? = contextStore.currentFarmId
}
