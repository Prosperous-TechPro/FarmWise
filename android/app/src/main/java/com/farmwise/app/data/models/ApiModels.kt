package com.farmwise.app.data.models

import com.google.gson.annotations.SerializedName

data class ApiEnvelope<T>(val success: Boolean, val data: T?, val message: String? = null)
data class LoginRequest(val email: String? = null, val phone: String? = null, val password: String, val deviceId: String? = null)
data class LoginData(val accessToken: String?, val refreshToken: String?, val requiresTwoFactor: Boolean = false, val user: UserDto? = null)
data class RegisterRequest(val firstName: String, val lastName: String, val email: String, val phone: String?, val password: String, val confirmPassword: String, val verificationMethod: String = "EMAIL")
data class OtpRequest(val userId: String, val code: String, val channel: String)
data class UserDto(val id: String, val firstName: String?, val lastName: String?, val email: String?, val roles: List<String> = emptyList())
data class DashboardOverviewDto(val totalFarms: Int = 0, val activeFarms: Int = 0, val financial: FinancialDto? = null, val activeTasks: Int = 0, val activeAlerts: Int = 0)
data class DashboardDto(val financial: FinancialDto?, val production: ProductionDto?, val crops: CropDashboardDto?, val livestock: LivestockDashboardDto?, val tasks: TaskSummaryDto?, val alerts: Any?, val inventory: InventoryDashboardDto?)
data class FinancialDto(val revenue: Double = 0.0, val expenses: Double = 0.0, val losses: Double = 0.0, val netProfit: Double = 0.0, val profitMargin: Double? = null, val status: String? = null)
data class ProductionDto(val recordCount: Int = 0, val totalsByUnit: Map<String, Double> = emptyMap())
data class CropDashboardDto(val activeCycles: Int = 0, val areaUnderCultivation: Double = 0.0)
data class LivestockDashboardDto(val totalAnimals: Int = 0, val births: Int = 0, val deaths: Int = 0)
data class TaskSummaryDto(val total: Int = 0, val completed: Int = 0, val pending: Int = 0, val overdue: Int = 0, val dueToday: Int = 0, val dueThisWeek: Int = 0)
data class InventoryDashboardDto(val totalItems: Int = 0, val lowStockItems: Int = 0, val outOfStockItems: Int = 0, val expiringItems: Int = 0, val expiredItems: Int = 0)
data class NotificationDto(val id: String, val title: String, val message: String, val severity: String, val status: String, val farmId: String)
