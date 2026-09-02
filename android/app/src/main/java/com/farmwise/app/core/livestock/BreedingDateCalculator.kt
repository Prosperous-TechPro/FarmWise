package com.farmwise.app.core.livestock

import java.time.LocalDate

object BreedingDateCalculator {
    const val pigGestationDays = 114L

    fun expectedFarrowingDate(matingDate: LocalDate, gestationDays: Long = pigGestationDays): LocalDate = matingDate.plusDays(gestationDays)
}
