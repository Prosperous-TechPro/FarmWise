package com.farmwise.app.core.livestock

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate

class BreedingDateCalculatorTest {
    @Test fun addsConfiguredPigGestationDays() {
        assertEquals(LocalDate.of(2026, 12, 12), BreedingDateCalculator.expectedFarrowingDate(LocalDate.of(2026, 8, 20)))
    }

    @Test fun handlesYearBoundary() {
        assertEquals(LocalDate.of(2027, 4, 24), BreedingDateCalculator.expectedFarrowingDate(LocalDate.of(2026, 12, 31)))
    }
}
