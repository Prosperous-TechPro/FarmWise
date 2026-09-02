package com.farmwise.app.presentation.production

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.ProductionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface ProductionUiState { data object Loading : ProductionUiState; data object Empty : ProductionUiState; data class Success(val harvests: List<HarvestDto>, val production: List<ProductionRecordDto>) : ProductionUiState; data class Error(val message: String) : ProductionUiState }
class ProductionViewModel(private val repository: ProductionRepository) : ViewModel() {
    private val _state = MutableStateFlow<ProductionUiState>(ProductionUiState.Loading)
    val state: StateFlow<ProductionUiState> = _state
    fun load() { viewModelScope.launch { _state.value = ProductionUiState.Loading; val harvests = repository.harvests().getOrElse { _state.value = ProductionUiState.Error(it.message ?: "Unable to load harvests"); return@launch }; val production = repository.production().getOrElse { _state.value = ProductionUiState.Error(it.message ?: "Unable to load production"); return@launch }; _state.value = if (harvests.isEmpty() && production.isEmpty()) ProductionUiState.Empty else ProductionUiState.Success(harvests, production) } }
    fun createHarvest(request: CreateHarvestRequest, onSuccess: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.createHarvest(request).onSuccess { onSuccess(); load() }.onFailure { onError(it.message ?: "Harvest recording failed") } } }
    fun createProduction(request: CreateProductionRequest, onSuccess: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.createProduction(request).onSuccess { onSuccess(); load() }.onFailure { onError(it.message ?: "Production recording failed") } } }
}
class ProductionViewModelFactory(private val repository: ProductionRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = ProductionViewModel(repository) as T }
