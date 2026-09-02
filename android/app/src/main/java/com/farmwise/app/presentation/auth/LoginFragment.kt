package com.farmwise.app.presentation.auth

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.core.security.TokenStore
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.data.repository.AuthRepository
import com.farmwise.app.databinding.FragmentLoginBinding
import kotlinx.coroutines.launch

class LoginFragment : Fragment(R.layout.fragment_login) {
    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentLoginBinding.bind(view)
        val repository = AuthRepository(NetworkModule.authApi(requireContext()), TokenStore(requireContext()), FarmContextStore(requireContext()))
        binding.loginButton.setOnClickListener {
            binding.loginButton.isEnabled = false
            lifecycleScope.launch {
                repository.login(binding.identifierInput.text?.toString().orEmpty(), binding.passwordInput.text?.toString().orEmpty())
                    .onSuccess { authenticated ->
                        if (authenticated) findNavController().navigate(R.id.dashboardFragment)
                        else findNavController().navigate(R.id.twoFactorFragment)
                    }
                    .onFailure { Toast.makeText(requireContext(), it.message ?: "Unable to sign in", Toast.LENGTH_LONG).show() }
                binding.loginButton.isEnabled = true
            }
        }
        binding.registerLink.setOnClickListener { findNavController().navigate(R.id.registerFragment) }
        binding.forgotPasswordLink.setOnClickListener { findNavController().navigate(R.id.otpFragment) }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
