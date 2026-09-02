package com.farmwise.app.presentation.livestock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.LivestockRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface LivestockUiState { data object Loading : LivestockUiState; data object Empty : LivestockUiState; data class Success(val animals: List<LivestockDto>) : LivestockUiState; data class Error(val message: String) : LivestockUiState }
class LivestockViewModel(private val repository: LivestockRepository) : ViewModel() {
    private val _state = MutableStateFlow<LivestockUiState>(LivestockUiState.Loading)
    val state: StateFlow<LivestockUiState> = _state
    val species = MutableStateFlow<List<LivestockSpeciesDto>>(emptyList())
    fun load() { viewModelScope.launch { _state.value = LivestockUiState.Loading; repository.species().onSuccess { species.value = it }; repository.list().onSuccess { _state.value = if (it.isEmpty()) LivestockUiState.Empty else LivestockUiState.Success(it) }.onFailure { _state.value = LivestockUiState.Error(it.message ?: "Unable to load livestock") } } }
    fun create(request: CreateLivestockRequest, onCreated: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.create(request).onSuccess { onCreated(); load() }.onFailure { onError(it.message ?: "Animal registration failed") } } }
}
class LivestockViewModelFactory(private val repository: LivestockRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = LivestockViewModel(repository) as T }
