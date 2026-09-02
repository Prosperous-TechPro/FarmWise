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
            binding.verificationState.text = "The backend does not currently expose a 2FA verification endpoint."
        } else {
            binding.verifyButton.setOnClickListener { verify() }
        }
    }

    private fun verify() {
        binding.verifyButton.isEnabled = false
        val request = OtpRequest(binding.userIdInput.text.toString().trim(), binding.codeInput.text.toString().trim(), "EMAIL")
        lifecycleScope.launch {
            runCatching { NetworkModule.authApi(requireContext()).verifyOtp(request) }
                .onSuccess { findNavController().navigate(R.id.loginFragment) }
                .onFailure { Toast.makeText(requireContext(), it.message ?: "Verification failed", Toast.LENGTH_LONG).show() }
            binding.verifyButton.isEnabled = true
        }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
