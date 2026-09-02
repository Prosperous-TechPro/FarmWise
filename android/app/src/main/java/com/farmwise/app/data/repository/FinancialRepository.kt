package com.farmwise.app.data.repository

import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.api.FinancialApi
import com.farmwise.app.data.models.*

class FinancialRepository(private val api: FinancialApi, private val context: FarmContextStore) {
    private fun farmId(): String = context.currentFarmId ?: error("Please select a farm first.")
    suspend fun summary(): Result<FinancialSummaryDto> = runCatching { api.profitability(farmId()).data ?: error("Financial summary unavailable") }
    suspend fun dashboard(): Result<DashboardDto> = runCatching { api.dashboard(farmId()).data ?: error("Financial dashboard unavailable") }
    suspend fun expenses(): Result<List<ExpenseBreakdownDto>> = runCatching { api.expenseBreakdown(farmId()).data ?: emptyList() }
    suspend fun trends(): Result<List<FinancialTrendDto>> = runCatching { api.trends(farmId()).data ?: emptyList() }
}
