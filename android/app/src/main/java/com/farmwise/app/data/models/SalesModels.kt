package com.farmwise.app.data.models

data class SaleDto(val id: String, val farmId: String, val saleNumber: String, val totalAmount: Double, val currency: String = "GHS", val paymentMethod: String = "CASH", val status: String = "DRAFT", val buyer: String? = null, val saleDate: String, val saleTime: String? = null, val notes: String? = null)
data class CreateSaleRequest(val saleNumber: String, val totalAmount: Double, val currency: String = "GHS", val paymentMethod: String = "CASH", val status: String = "DRAFT", val buyer: String? = null, val saleDate: String, val notes: String? = null)
