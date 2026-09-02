package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.LivestockApi
import com.farmwise.app.data.models.*

class LivestockRepository(private val api: LivestockApi, private val context: FarmContextStore) {
    private fun requireFarm(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun list(sex: String? = null, status: String? = null, tagNumber: String? = null): Result<List<LivestockDto>> = runCatching { api.list(requireFarm(), sex, status, tagNumber).data ?: emptyList() }
    suspend fun get(id: String): Result<LivestockDto> = runCatching { api.get(requireFarm(), id).data ?: error("Animal is no longer available.") }
    suspend fun create(request: CreateLivestockRequest): Result<LivestockDto> = runCatching { api.create(requireFarm(), request).data ?: error("Animal registration failed") }
    suspend fun species(): Result<List<LivestockSpeciesDto>> = runCatching { api.species().data ?: emptyList() }
    suspend fun breeds(speciesId: String): Result<List<LivestockBreedDto>> = runCatching { api.breeds(speciesId).data ?: emptyList() }
    suspend fun breeding(id: String): Result<List<BreedingDto>> = runCatching { api.breeding(requireFarm(), id).data ?: emptyList() }
    suspend fun createBreeding(id: String, request: CreateBreedingRequest): Result<BreedingDto> = runCatching { api.createBreeding(requireFarm(), id, request).data ?: error("Breeding record failed") }
}
