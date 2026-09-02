package com.farmwise.app.presentation.production

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.ProductionRepository
import com.farmwise.app.databinding.FragmentHarvestDetailsBinding
import kotlinx.coroutines.launch

class HarvestDetailsFragment : Fragment(R.layout.fragment_harvest_details) {
    private var _binding: FragmentHarvestDetailsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentHarvestDetailsBinding.bind(view); val id = requireArguments().getString("harvestId").orEmpty(); viewLifecycleOwner.lifecycleScope.launch { ProductionRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext())).harvests().onSuccess { harvest -> val item = harvest.firstOrNull { it.id == id }; if (item == null) binding.harvestDetailsState.text = "Harvest is no longer available." else { binding.harvestDetailsTitle.text = "Harvest ${item.id}"; binding.harvestDetailsBody.text = "Crop cycle: ${item.cropCycleId}\nDate: ${item.harvestDate}\nQuantity: ${item.quantity} ${item.quantityUnit}\nGrade: ${item.grade ?: "Not recorded"}" } }.onFailure { binding.harvestDetailsState.text = it.message } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
