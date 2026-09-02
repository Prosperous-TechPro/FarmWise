package com.farmwise.app.presentation.crops

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.CropCycleDto
import com.farmwise.app.data.models.CropDto
import com.farmwise.app.data.repository.CropRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface CropUiState { data object Loading : CropUiState; data object Empty : CropUiState; data class Success(val cycles: List<CropCycleDto>) : CropUiState; data class Error(val message: String) : CropUiState }
class CropViewModel(private val repository: CropRepository) : ViewModel() {
    private val _state = MutableStateFlow<CropUiState>(CropUiState.Loading)
    val state: StateFlow<CropUiState> = _state
    val cropTypes = MutableStateFlow<List<CropDto>>(emptyList())
    fun load() { viewModelScope.launch { _state.value = CropUiState.Loading; repository.crops().onSuccess { cropTypes.value = it }; repository.cycles().onSuccess { _state.value = if (it.isEmpty()) CropUiState.Empty else CropUiState.Success(it) }.onFailure { _state.value = CropUiState.Error(it.message ?: "Unable to load crop cycles") } } }
    fun createCycle(request: com.farmwise.app.data.models.CreateCropCycleRequest, onCreated: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.createCycle(request).onSuccess { onCreated() }.onFailure { onError(it.message ?: "Unable to create crop cycle") } } }
}
class CropViewModelFactory(private val repository: CropRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = CropViewModel(repository) as T }
