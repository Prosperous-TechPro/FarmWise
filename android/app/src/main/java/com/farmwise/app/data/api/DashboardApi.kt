package com.farmwise.app.data.api

import com.farmwise.app.data.models.ApiEnvelope
import com.farmwise.app.data.models.DashboardDto
import com.farmwise.app.data.models.DashboardOverviewDto
import retrofit2.http.GET
import retrofit2.http.Query

interface DashboardApi {
    @GET("dashboard/overview") suspend fun overview(@Query("farmId") farmId: String? = null): ApiEnvelope<DashboardOverviewDto>
    @GET("farms/{farmId}/dashboard") suspend fun farmDashboard(@retrofit2.http.Path("farmId") farmId: String, @Query("dateFrom") dateFrom: String? = null, @Query("dateTo") dateTo: String? = null): ApiEnvelope<DashboardDto>
}
