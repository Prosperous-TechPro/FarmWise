package com.farmwise.app.presentation.farms

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.CreateFarmRequest
import com.farmwise.app.data.models.FarmDto
import com.farmwise.app.data.models.UpdateFarmRequest
import com.farmwise.app.data.repository.FarmRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface FarmUiState {
    data object Loading : FarmUiState
    data object Empty : FarmUiState
    data class Success(val farms: List<FarmDto>, val selectedFarmId: String? = null) : FarmUiState
    data class Error(val message: String) : FarmUiState
}

class FarmViewModel(private val repository: FarmRepository) : ViewModel() {
    private val _state = MutableStateFlow<FarmUiState>(FarmUiState.Loading)
    val state: StateFlow<FarmUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.value = FarmUiState.Loading
            repository.list().onSuccess { farms ->
                val selected = farms.firstOrNull { it.id == repository.selectedFarmId() } ?: farms.firstOrNull()
                if (selected != null && repository.selectedFarmId() != selected.id) repository.select(selected)
                _state.value = if (farms.isEmpty()) FarmUiState.Empty else FarmUiState.Success(farms, selected?.id)
            }.onFailure { _state.value = FarmUiState.Error(it.message ?: "Unable to load farms") }
        }
    }

    fun select(farm: FarmDto) {
        repository.select(farm)
        val current = _state.value
        if (current is FarmUiState.Success) _state.value = current.copy(selectedFarmId = farm.id)
    }

    fun create(request: CreateFarmRequest, onCreated: (FarmDto) -> Unit) {
        if (request.name.isBlank()) { _state.value = FarmUiState.Error("Farm name is required."); return }
        viewModelScope.launch {
            repository.create(request).onSuccess { farm -> repository.select(farm); onCreated(farm); load() }
                .onFailure { _state.value = FarmUiState.Error(it.message ?: "Unable to create farm") }
        }
    }

    fun update(farmId: String, request: UpdateFarmRequest, onUpdated: (FarmDto) -> Unit) {
        viewModelScope.launch {
            repository.update(farmId, request).onSuccess { farm -> onUpdated(farm); load() }
                .onFailure { _state.value = FarmUiState.Error(it.message ?: "Unable to update farm") }
        }
    }
}

class FarmViewModelFactory(private val repository: FarmRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = FarmViewModel(repository) as T
}
