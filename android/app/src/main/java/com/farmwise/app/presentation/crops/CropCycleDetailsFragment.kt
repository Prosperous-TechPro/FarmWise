package com.farmwise.app.presentation.crops

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.CropRepository
import com.farmwise.app.databinding.FragmentCropCycleDetailsBinding
import kotlinx.coroutines.launch

class CropCycleDetailsFragment : Fragment(R.layout.fragment_crop_cycle_details) {
    private var _binding: FragmentCropCycleDetailsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentCropCycleDetailsBinding.bind(view)
        val cycleId = requireArguments().getString("cycleId").orEmpty()
        val repository = CropRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))
        viewLifecycleOwner.lifecycleScope.launch { repository.cycle(cycleId).onSuccess { cycle -> binding.cycleDetailsTitle.text = cycle.crop?.name ?: "Crop cycle"; binding.cycleDetailsBody.text = "Field: ${cycle.field?.name ?: cycle.fieldId}\nStatus: ${cycle.status}\nPlanting: ${cycle.plantingDate ?: "Not recorded"}\nExpected harvest: ${cycle.expectedHarvestDate ?: "Not set"}\nArea: ${cycle.plantedArea ?: "Not recorded"} ${cycle.areaUnit ?: ""}" }.onFailure { binding.cycleDetailsState.text = it.message ?: "Crop cycle is no longer available." } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}