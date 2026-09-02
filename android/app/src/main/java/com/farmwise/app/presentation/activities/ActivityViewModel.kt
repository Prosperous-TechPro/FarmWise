package com.farmwise.app.presentation.activities

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.ActivityRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface ActivityUiState { data object Loading : ActivityUiState; data object Empty : ActivityUiState; data class Success(val activities: List<FarmActivityDto>) : ActivityUiState; data class Error(val message: String) : ActivityUiState }
class ActivityViewModel(private val repository: ActivityRepository) : ViewModel() {
    private val _state = MutableStateFlow<ActivityUiState>(ActivityUiState.Loading)
    val state: StateFlow<ActivityUiState> = _state
    val types = MutableStateFlow<List<ActivityTypeDto>>(emptyList())
    fun load() { viewModelScope.launch { _state.value = ActivityUiState.Loading; repository.types().onSuccess { types.value = it }; repository.list().onSuccess { _state.value = if (it.isEmpty()) ActivityUiState.Empty else ActivityUiState.Success(it) }.onFailure { _state.value = ActivityUiState.Error(it.message ?: "Unable to load activities") } } }
    fun create(request: CreateActivityRequest, onCreated: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.create(request).onSuccess { onCreated(); load() }.onFailure { onError(it.message ?: "Activity recording failed") } } }
}
class ActivityViewModelFactory(private val repository: ActivityRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = ActivityViewModel(repository) as T }
