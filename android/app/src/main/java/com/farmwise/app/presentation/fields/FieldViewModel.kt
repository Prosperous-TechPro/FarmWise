package com.farmwise.app.presentation.fields

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.FieldRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface FieldUiState { data object Loading : FieldUiState; data object Empty : FieldUiState; data class Success(val fields: List<FieldDto>) : FieldUiState; data class Error(val message: String) : FieldUiState }

class FieldViewModel(private val repository: FieldRepository) : ViewModel() {
    private val _state = MutableStateFlow<FieldUiState>(FieldUiState.Loading)
    val state: StateFlow<FieldUiState> = _state
    fun load() { viewModelScope.launch { _state.value = FieldUiState.Loading; repository.list().onSuccess { _state.value = if (it.isEmpty()) FieldUiState.Empty else FieldUiState.Success(it) }.onFailure { _state.value = FieldUiState.Error(it.message ?: "Unable to load fields") } } }
    fun create(request: CreateFieldRequest, onCreated: (FieldDto) -> Unit) { viewModelScope.launch { repository.create(request).onSuccess { onCreated(it); load() }.onFailure { _state.value = FieldUiState.Error(it.message ?: "Unable to create field") } } }
    fun update(id: String, request: UpdateFieldRequest, onUpdated: (FieldDto) -> Unit) { viewModelScope.launch { repository.update(id, request).onSuccess { onUpdated(it) }.onFailure { _state.value = FieldUiState.Error(it.message ?: "Unable to update field") } } }
}
class FieldViewModelFactory(private val repository: FieldRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = FieldViewModel(repository) as T }
