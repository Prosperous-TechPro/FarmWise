package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.CropApi
import com.farmwise.app.data.models.*

class ProductionRepository(private val api: CropApi, private val context: FarmContextStore) {
    private fun farmId(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun harvests(cycleId: String? = null): Result<List<HarvestDto>> = runCatching { api.listHarvests(farmId(), cycleId).data ?: emptyList() }
    suspend fun createHarvest(request: CreateHarvestRequest): Result<HarvestDto> = runCatching { api.createHarvest(farmId(), request).data ?: error("Harvest recording failed") }
    suspend fun production(): Result<List<ProductionRecordDto>> = runCatching { api.listProduction(farmId()).data ?: emptyList() }
    suspend fun createProduction(request: CreateProductionRequest): Result<ProductionRecordDto> = runCatching { api.createProduction(farmId(), request).data ?: error("Production recording failed") }
}
