package com.farmwise.app.data.api

import com.farmwise.app.data.models.*
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface FinancialApi {
    @GET("farms/{farmId}/profitability") suspend fun profitability(@Path("farmId") farmId: String): ApiEnvelope<FinancialSummaryDto>
    @GET("farms/{farmId}/dashboard") suspend fun dashboard(@Path("farmId") farmId: String, @Query("dateFrom") dateFrom: String? = null, @Query("dateTo") dateTo: String? = null): ApiEnvelope<DashboardDto>
    @GET("analytics/expenses") suspend fun expenseBreakdown(@Query("farmId") farmId: String? = null, @Query("dateFrom") dateFrom: String? = null, @Query("dateTo") dateTo: String? = null): ApiEnvelope<List<ExpenseBreakdownDto>>
    @GET("analytics/sales") suspend fun salesAnalytics(@Query("farmId") farmId: String? = null, @Query("dateFrom") dateFrom: String? = null, @Query("dateTo") dateTo: String? = null): ApiEnvelope<Any>
    @GET("analytics/trends") suspend fun trends(@Query("farmId") farmId: String? = null, @Query("dateFrom") dateFrom: String? = null, @Query("dateTo") dateTo: String? = null, @Query("groupBy") groupBy: String? = "MONTH"): ApiEnvelope<List<FinancialTrendDto>>
}
