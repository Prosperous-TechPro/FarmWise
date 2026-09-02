package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.FieldApi
import com.farmwise.app.data.models.*

class FieldRepository(private val api: FieldApi, private val context: FarmContextStore) {
    private fun requireFarm(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun list(): Result<List<FieldDto>> = runCatching { api.list(requireFarm()).data ?: emptyList() }
    suspend fun get(fieldId: String): Result<FieldDto> = runCatching { api.get(requireFarm(), fieldId).data ?: error("Field is no longer available.") }
    suspend fun create(request: CreateFieldRequest): Result<FieldDto> = runCatching { api.create(requireFarm(), request).data ?: error("Field creation failed") }
    suspend fun update(fieldId: String, request: UpdateFieldRequest): Result<FieldDto> = runCatching { api.update(requireFarm(), fieldId, request).data ?: error("Field update failed") }
}
