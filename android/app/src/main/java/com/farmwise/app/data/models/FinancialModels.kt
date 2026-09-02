package com.farmwise.app.data.models

data class FinancialSummaryDto(val totalRevenue: Double = 0.0, val totalExpenses: Double = 0.0, val totalLosses: Double = 0.0, val totalBudget: Double = 0.0, val netProfit: Double = 0.0, val expenseCount: Int = 0, val saleCount: Int = 0, val lossCount: Int = 0, val budgetCount: Int = 0)
data class ExpenseBreakdownDto(val category: String, val amount: Double, val records: Int = 0)
data class FinancialTrendDto(val date: String, val revenue: Double = 0.0, val expenses: Double = 0.0, val production: List<ProductionPointDto> = emptyList())
data class ProductionPointDto(val unit: String, val quantity: Double)
