package com.farmwise.app.core.financial

import org.junit.Assert.assertEquals
import org.junit.Test

class FinancialStatusTest {
    @Test fun usesBackendStatusWhenAvailable() { assertEquals("MANAGEABLE", FinancialStatus.resolve(500.0, 20000.0, "MANAGEABLE")) }
    @Test fun identifiesLossAndBreakEven() { assertEquals("LOSS", FinancialStatus.resolve(-1.0, 100.0)); assertEquals("BREAK_EVEN", FinancialStatus.resolve(0.0, 100.0)) }
    @Test fun distinguishesNoActivityFromProfit() { assertEquals("NO_FINANCIAL_ACTIVITY", FinancialStatus.resolve(0.0, 0.0)) }
}
