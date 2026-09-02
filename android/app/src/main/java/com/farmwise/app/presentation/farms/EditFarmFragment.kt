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
import com.farmwise.app.data.models.UpdateFarmRequest
import com.farmwise.app.data.repository.FarmRepository
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.farmwise.app.databinding.FragmentEditFarmBinding
import kotlinx.coroutines.launch

class EditFarmFragment : Fragment(R.layout.fragment_edit_farm) {
    private var _binding: FragmentEditFarmBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: FarmRepository
    private lateinit var farmId: String

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentEditFarmBinding.bind(view)
        repository = FarmRepository(NetworkModule.farmApi(requireContext()), FarmContextStore(requireContext()))
        farmId = requireArguments().getString("farmId").orEmpty()
        binding.saveFarmButton.setOnClickListener { save() }
        viewLifecycleOwner.lifecycleScope.launch { repository.get(farmId).onSuccess { populate(it) }.onFailure { binding.editFarmState.text = it.message } }
    }

    private fun populate(farm: com.farmwise.app.data.models.FarmDto) {
        binding.editFarmNameInput.setText(farm.name); binding.editRegionInput.setText(farm.region); binding.editDistrictInput.setText(farm.district); binding.editCountryInput.setText(farm.country); binding.editDescriptionInput.setText(farm.description); binding.editStatusInput.setText(farm.status ?: "ACTIVE")
    }

    private fun save() {
        val name = binding.editFarmNameInput.text.toString().trim()
        if (name.isBlank()) { binding.editFarmState.text = "Farm name is required."; return }
        binding.saveFarmButton.isEnabled = false
        viewLifecycleOwner.lifecycleScope.launch {
            val status = binding.editStatusInput.text.toString().trim().uppercase()
            if (status !in setOf("ACTIVE", "INACTIVE", "ARCHIVED")) { binding.editFarmState.text = "Status must be ACTIVE, INACTIVE, or ARCHIVED."; binding.saveFarmButton.isEnabled = true; return@launch }
            repository.update(farmId, UpdateFarmRequest(name, binding.editDescriptionInput.text.toString().trim().ifBlank { null }, binding.editRegionInput.text.toString().trim().ifBlank { null }, binding.editDistrictInput.text.toString().trim().ifBlank { null }, binding.editCountryInput.text.toString().trim().ifBlank { null }, status))
                .onSuccess { findNavController().popBackStack() }
                .onFailure { binding.editFarmState.text = it.message ?: "Unable to update farm"; binding.saveFarmButton.isEnabled = true }
        }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
