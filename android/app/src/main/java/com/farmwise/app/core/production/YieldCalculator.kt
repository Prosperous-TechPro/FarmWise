package com.farmwise.app.core.production

object YieldCalculator {
    fun calculate(quantity: Double?, quantityUnit: String?, area: Double?, areaUnit: String?): YieldResult {
        if (quantity == null || quantity <= 0) return YieldResult.Unavailable("PRODUCTION_QUANTITY_MISSING")
        if (area == null || area <= 0) return YieldResult.Unavailable("FIELD_AREA_MISSING")
        if (quantityUnit != "KILOGRAM") return YieldResult.Unavailable("INCOMPATIBLE_PRODUCTION_UNIT")
        if (areaUnit !in setOf("ACRE", "HECTARE")) return YieldResult.Unavailable("INCOMPATIBLE_AREA_UNIT")
        return YieldResult.Available(quantity / area, "KILOGRAM_PER_$areaUnit")
    }
}

sealed interface YieldResult { data class Available(val value: Double, val unit: String) : YieldResult; data class Unavailable(val reason: String) : YieldResult }
