package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.CropApi
import com.farmwise.app.data.models.*

class CropRepository(private val api: CropApi, private val context: FarmContextStore) {
    private fun requireFarm(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun crops(): Result<List<CropDto>> = runCatching { api.listCrops().data ?: emptyList() }
    suspend fun cycles(fieldId: String? = null): Result<List<CropCycleDto>> = runCatching { api.listCycles(requireFarm(), fieldId).data ?: emptyList() }
    suspend fun cycle(cycleId: String): Result<CropCycleDto> = runCatching { api.getCycle(requireFarm(), cycleId).data ?: error("Crop cycle is no longer available.") }
    suspend fun createCycle(request: CreateCropCycleRequest): Result<CropCycleDto> = runCatching { api.createCycle(requireFarm(), request).data ?: error("Crop cycle creation failed") }
    suspend fun archiveCycle(cycleId: String): Result<CropCycleDto> = runCatching { api.archiveCycle(requireFarm(), cycleId).data ?: error("Crop cycle archive failed") }
    suspend fun activities(cycleId: String): Result<List<CropActivityDto>> = runCatching { api.listActivities(requireFarm(), cycleId).data ?: emptyList() }
    suspend fun recordActivity(cycleId: String, request: CreateCropActivityRequest): Result<CropActivityDto> = runCatching { api.createActivity(requireFarm(), cycleId, request).data ?: error("Activity recording failed") }
    suspend fun inputs(cycleId: String): Result<List<CropInputDto>> = runCatching { api.listInputs(requireFarm(), cycleId).data ?: emptyList() }
    suspend fun production(): Result<List<ProductionRecordDto>> = runCatching { api.listProduction(requireFarm()).data ?: emptyList() }
    suspend fun harvests(cycleId: String? = null): Result<List<HarvestDto>> = runCatching { api.listHarvests(requireFarm(), cycleId).data ?: emptyList() }
    suspend fun createProduction(request: CreateProductionRequest): Result<ProductionRecordDto> = runCatching { api.createProduction(requireFarm(), request).data ?: error("Production recording failed") }
    suspend fun createHarvest(request: CreateHarvestRequest): Result<HarvestDto> = runCatching { api.createHarvest(requireFarm(), request).data ?: error("Harvest recording failed") }
}
