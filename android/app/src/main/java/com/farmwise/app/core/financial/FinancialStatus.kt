package com.farmwise.app.core.financial

object FinancialStatus {
    fun resolve(netProfit: Double, revenue: Double, backendStatus: String? = null): String {
        if (!backendStatus.isNullOrBlank()) return backendStatus
        if (revenue == 0.0 && netProfit == 0.0) return "NO_FINANCIAL_ACTIVITY"
        if (netProfit < 0) return "LOSS"
        if (netProfit == 0.0) return "BREAK_EVEN"
        return "PROFIT"
    }
}
