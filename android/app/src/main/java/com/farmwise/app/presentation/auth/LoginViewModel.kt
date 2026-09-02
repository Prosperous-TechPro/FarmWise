package com.farmwise.app.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.farmwise.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface LoginState {
    data object Idle : LoginState
    data object Loading : LoginState
    data object Success : LoginState
    data object RequiresTwoFactor : LoginState
    data class Error(val message: String) : LoginState
}

class LoginViewModel(private val repository: AuthRepository) : ViewModel() {
    private val _state = MutableStateFlow<LoginState>(LoginState.Idle)
    val state: StateFlow<LoginState> = _state

    fun login(identifier: String, password: String) {
        if (identifier.isBlank() || password.isBlank()) {
            _state.value = LoginState.Error("Enter your email or phone and password")
            return
        }
        viewModelScope.launch {
            _state.value = LoginState.Loading
            repository.login(identifier.trim(), password).onSuccess { authenticated ->
                _state.value = if (authenticated) LoginState.Success else LoginState.RequiresTwoFactor
            }.onFailure { error -> _state.value = LoginState.Error(error.message ?: "Unable to sign in") }
        }
    }
}
