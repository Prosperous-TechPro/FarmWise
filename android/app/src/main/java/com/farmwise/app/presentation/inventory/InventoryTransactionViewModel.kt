package com.farmwise.app.presentation.inventory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.models.*
import com.farmwise.app.data.repository.InventoryRepository
import kotlinx.coroutines.launch

class InventoryTransactionViewModel(private val repository: InventoryRepository) : ViewModel() {
    fun receive(request: ReceiveInventoryRequest, onSuccess: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.receive(request).onSuccess { onSuccess() }.onFailure { onError(it.message ?: "Stock receipt failed") } } }
    fun issue(request: IssueInventoryRequest, onSuccess: () -> Unit, onError: (String) -> Unit) { viewModelScope.launch { repository.issue(request).onSuccess { onSuccess() }.onFailure { onError(it.message ?: "Stock usage failed") } } }
}
class InventoryTransactionViewModelFactory(private val repository: InventoryRepository) : ViewModelProvider.Factory { @Suppress("UNCHECKED_CAST") override fun <T : ViewModel> create(modelClass: Class<T>): T = InventoryTransactionViewModel(repository) as T }
