package com.farmwise.app.presentation.farms

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateFarmRequest
import com.farmwise.app.data.repository.FarmRepository
import com.farmwise.app.databinding.FragmentAddFarmBinding
import kotlinx.coroutines.launch

class AddFarmFragment : Fragment(R.layout.fragment_add_farm) {
    private var _binding: FragmentAddFarmBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: FarmViewModel

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddFarmBinding.bind(view)
        viewModel = ViewModelProvider(this, FarmViewModelFactory(FarmRepository(NetworkModule.farmApi(requireContext()), FarmContextStore(requireContext()))))[FarmViewModel::class.java]
        binding.createFarmButton.setOnClickListener { submit() }
    }

    private fun submit() {
        val name = binding.farmNameInput.text.toString().trim()
        if (name.isBlank()) { binding.addFarmState.text = "Farm name is required."; return }
        binding.createFarmButton.isEnabled = false
        binding.addFarmState.text = "Creating farm..."
        val request = CreateFarmRequest(name, binding.farmDescriptionInput.text.toString().trim().ifBlank { null }, binding.regionInput.text.toString().trim().ifBlank { null }, binding.districtInput.text.toString().trim().ifBlank { null }, binding.countryInput.text.toString().trim().ifBlank { null })
        viewModel.create(request) { findNavController().navigate(R.id.farmDetailsFragment, android.os.Bundle().apply { putString("farmId", it.id) }) }
        viewLifecycleOwner.lifecycleScope.launch { viewModel.state.collect { if (it is FarmUiState.Error) { binding.addFarmState.text = it.message; binding.createFarmButton.isEnabled = true } } }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
