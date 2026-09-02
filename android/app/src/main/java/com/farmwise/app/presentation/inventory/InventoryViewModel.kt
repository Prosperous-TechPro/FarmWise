package com.farmwise.app.presentation.inventory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.InventoryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface InventoryUiState { data object Loading : InventoryUiState; data object Empty : InventoryUiState; data class Success(val items: List<InventoryItemDto>, val summary: InventorySummaryDto?) : InventoryUiState; data class Error(val message: String) : InventoryUiState }
class InventoryViewModel(private val repository: InventoryRepository) : ViewModel() {
    private val _state = MutableStateFlow<InventoryUiState>(InventoryUiState.Loading)
    val state: StateFlow<InventoryUiState> = _state
    fun load() { viewModelScope.launch { _state.value = InventoryUiState.Loading; val summary = repository.summary().getOrNull(); repository.items().onSuccess { _state.value = if (it.isEmpty()) InventoryUiState.Empty else InventoryUiState.Success(it, summary) }.onFailure { _state.value = InventoryUiState.Error(it.message ?: "Unable to load inventory") } } }
    fun createItem(request: CreateInventoryItemRequest, onCreated: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.createItem(request).onSuccess { onCreated(); load() }.onFailure { onError(it.message ?: "Inventory item creation failed") } } }
}
class InventoryViewModelFactory(private val repository: InventoryRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = InventoryViewModel(repository) as T }
