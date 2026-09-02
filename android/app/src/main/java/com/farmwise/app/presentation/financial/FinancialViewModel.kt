package com.farmwise.app.presentation.financial

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.FinancialRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface FinancialUiState { data object Loading : FinancialUiState; data object Empty : FinancialUiState; data class Success(val summary: FinancialSummaryDto, val backendFinancial: FinancialDto?, val expenses: List<ExpenseBreakdownDto>, val trends: List<FinancialTrendDto>) : FinancialUiState; data class Error(val message: String) : FinancialUiState }
class FinancialViewModel(private val repository: FinancialRepository) : ViewModel() {
    private val _state = MutableStateFlow<FinancialUiState>(FinancialUiState.Loading)
    val state: StateFlow<FinancialUiState> = _state
    fun load() { viewModelScope.launch { _state.value = FinancialUiState.Loading; val summary = repository.summary().getOrElse { _state.value = FinancialUiState.Error(it.message ?: "Unable to load financial summary"); return@launch }; val dashboard = repository.dashboard().getOrNull(); val expenses = repository.expenses().getOrElse { emptyList() }; val trends = repository.trends().getOrElse { emptyList() }; _state.value = if (summary.expenseCount == 0 && summary.saleCount == 0 && summary.lossCount == 0) FinancialUiState.Empty else FinancialUiState.Success(summary, dashboard?.financial, expenses, trends) } }
}
class FinancialViewModelFactory(private val repository: FinancialRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = FinancialViewModel(repository) as T }
