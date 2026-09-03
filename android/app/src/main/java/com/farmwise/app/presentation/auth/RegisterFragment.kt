package com.farmwise.app.presentation.auth

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.RegisterRequest
import com.farmwise.app.databinding.FragmentRegisterBinding
import kotlinx.coroutines.launch

class RegisterFragment : Fragment(R.layout.fragment_register) {
    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentRegisterBinding.bind(view)
        binding.registerButton.setOnClickListener { register() }
    }

    private fun register() {
        val phone = binding.phoneInput.text.toString().trim()
        if (phone.isBlank()) {
            binding.registerState.text = "Phone number is required."
            return
        }
        binding.registerButton.isEnabled = false
        val request = RegisterRequest(
            binding.firstNameInput.text.toString().trim(), binding.lastNameInput.text.toString().trim(),
            binding.emailInput.text.toString().trim(), phone,
            binding.registerPasswordInput.text.toString(), binding.confirmPasswordInput.text.toString(),
            if (binding.emailMethod.isChecked) "EMAIL" else "SMS",
        )
        lifecycleScope.launch {
            runCatching { NetworkModule.authApi(requireContext()).register(request) }
                .onSuccess { response ->
                    val registration = response.data
                    if (registration == null) {
                        binding.registerState.text = "Registration did not return a verification request."
                    } else {
                        findNavController().navigate(R.id.otpFragment, Bundle().apply {
                            putString("pendingRegistrationId", registration.pendingRegistrationId)
                            putString("channel", registration.verificationMethod)
                        })
                    }
                }
                .onFailure { Toast.makeText(requireContext(), it.message ?: "Registration failed", Toast.LENGTH_LONG).show() }
            binding.registerButton.isEnabled = true
        }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
