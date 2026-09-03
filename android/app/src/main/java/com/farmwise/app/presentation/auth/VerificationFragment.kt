package com.farmwise.app.presentation.auth

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.OtpRequest
import com.farmwise.app.databinding.FragmentVerificationBinding
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay

class VerificationFragment : Fragment(R.layout.fragment_verification) {
    private var _binding: FragmentVerificationBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentVerificationBinding.bind(view)
        val isTwoFactor = arguments?.getBoolean("twoFactor") == true
        if (isTwoFactor) {
            binding.verificationTitle.text = "Two-factor verification"
            binding.verificationDescription.text = "Enter your second-factor code to continue."
            binding.verifyButton.isEnabled = false
            binding.resendButton.isEnabled = false
            binding.verificationState.text = "The backend does not currently expose a 2FA verification endpoint."
        } else {
            binding.userIdInput.visibility = if (arguments?.getString("pendingRegistrationId").isNullOrBlank()) View.VISIBLE else View.GONE
            binding.verifyButton.setOnClickListener { verify() }
            binding.resendButton.setOnClickListener { resend() }
        }
    }

    private fun verify() {
        binding.verifyButton.isEnabled = false
        val pendingRegistrationId = arguments?.getString("pendingRegistrationId")
        val channel = arguments?.getString("channel") ?: "EMAIL"
        val userId = binding.userIdInput.text.toString().trim().ifBlank { null }
        if (pendingRegistrationId.isNullOrBlank() && userId.isNullOrBlank()) {
            binding.verificationState.text = "Enter a user ID or register again."
            binding.verifyButton.isEnabled = true
            return
        }
        val request = OtpRequest(pendingRegistrationId = pendingRegistrationId?.takeUnless { it.isBlank() }, userId = userId, code = binding.codeInput.text.toString().trim(), channel = channel)
        lifecycleScope.launch {
            runCatching { NetworkModule.authApi(requireContext()).verifyOtp(request) }
                .onSuccess { findNavController().navigate(R.id.loginFragment) }
                .onFailure { Toast.makeText(requireContext(), it.message ?: "Verification failed", Toast.LENGTH_LONG).show() }
            binding.verifyButton.isEnabled = true
        }
    }

    private fun resend() {
        val pendingRegistrationId = arguments?.getString("pendingRegistrationId") ?: return
        val channel = arguments?.getString("channel") ?: "EMAIL"
        binding.resendButton.isEnabled = false
        lifecycleScope.launch {
            runCatching { NetworkModule.authApi(requireContext()).resendOtp(mapOf("pendingRegistrationId" to pendingRegistrationId, "channel" to channel)) }
                .onSuccess {
                    val cooldown = it.data?.retryAfter ?: 60
                    repeat(cooldown) { remaining ->
                        binding.resendButton.text = "Resend in ${cooldown - remaining}s"
                        delay(1000)
                    }
                }
                .onFailure { Toast.makeText(requireContext(), it.message ?: "Unable to resend code", Toast.LENGTH_LONG).show() }
            binding.resendButton.text = "Resend code"
            binding.resendButton.isEnabled = true
        }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
