package com.farmwise.app.presentation.sales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.SalesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface SalesUiState { data object Loading : SalesUiState; data object Empty : SalesUiState; data class Success(val sales: List<SaleDto>) : SalesUiState; data class Error(val message: String) : SalesUiState }
class SalesViewModel(private val repository: SalesRepository) : ViewModel() {
    private val _state = MutableStateFlow<SalesUiState>(SalesUiState.Loading)
    val state: StateFlow<SalesUiState> = _state
    fun load() { viewModelScope.launch { _state.value = SalesUiState.Loading; repository.list().onSuccess { _state.value = if (it.isEmpty()) SalesUiState.Empty else SalesUiState.Success(it) }.onFailure { _state.value = SalesUiState.Error(it.message ?: "Unable to load sales") } } }
    fun create(request: CreateSaleRequest, onSuccess: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.create(request).onSuccess { onSuccess(); load() }.onFailure { onError(it.message ?: "Sale creation failed") } } }
}
class SalesViewModelFactory(private val repository: SalesRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = SalesViewModel(repository) as T }
