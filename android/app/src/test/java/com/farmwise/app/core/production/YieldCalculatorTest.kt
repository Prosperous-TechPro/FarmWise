package com.farmwise.app.core.production

import org.junit.Assert.assertEquals
import org.junit.Test

class YieldCalculatorTest {
    @Test fun calculatesKilogramsPerHectare() { val result = YieldCalculator.calculate(1500.0, "KILOGRAM", 1.0, "HECTARE") as YieldResult.Available; assertEquals(1500.0, result.value, 0.001); assertEquals("KILOGRAM_PER_HECTARE", result.unit) }
    @Test fun rejectsMissingArea() { assertEquals(YieldResult.Unavailable("FIELD_AREA_MISSING"), YieldCalculator.calculate(1500.0, "KILOGRAM", null, "HECTARE")) }
    @Test fun rejectsIncompatibleUnits() { assertEquals(YieldResult.Unavailable("INCOMPATIBLE_PRODUCTION_UNIT"), YieldCalculator.calculate(10.0, "BAG", 1.0, "HECTARE")) }
}
