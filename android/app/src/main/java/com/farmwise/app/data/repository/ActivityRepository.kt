package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.ActivityApi
import com.farmwise.app.data.models.*

class ActivityRepository(private val api: ActivityApi, private val context: FarmContextStore) {
    private fun farmId(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun types(): Result<List<ActivityTypeDto>> = runCatching { api.types(farmId()).data ?: emptyList() }
    suspend fun list(status: String? = null, category: String? = null): Result<List<FarmActivityDto>> = runCatching { api.list(farmId(), status, category).data ?: emptyList() }
    suspend fun get(id: String): Result<FarmActivityDto> = runCatching { api.get(farmId(), id).data ?: error("Activity is no longer available.") }
    suspend fun create(request: CreateActivityRequest): Result<FarmActivityDto> = runCatching { api.create(farmId(), request).data ?: error("Activity recording failed") }
}
