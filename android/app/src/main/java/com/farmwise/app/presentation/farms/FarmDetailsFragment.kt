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
import com.farmwise.app.data.repository.FarmRepository
import com.farmwise.app.databinding.FragmentFarmDetailsBinding
import kotlinx.coroutines.launch

class FarmDetailsFragment : Fragment(R.layout.fragment_farm_details) {
    private var _binding: FragmentFarmDetailsBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: FarmRepository

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentFarmDetailsBinding.bind(view)
        repository = FarmRepository(NetworkModule.farmApi(requireContext()), FarmContextStore(requireContext()))
        val farmId = requireArguments().getString("farmId").orEmpty()
        binding.viewFieldsButton.setOnClickListener { findNavController().navigate(R.id.fieldListFragment) }
        binding.viewCropCyclesButton.setOnClickListener { findNavController().navigate(R.id.cropCycleListFragment) }
        binding.viewLivestockButton.setOnClickListener { findNavController().navigate(R.id.animalListFragment) }
        binding.viewOperationsButton.setOnClickListener { findNavController().navigate(R.id.dailyOperationsFragment) }
        binding.viewProductionButton.setOnClickListener { findNavController().navigate(R.id.productionDashboardFragment) }
        binding.viewSalesButton.setOnClickListener { findNavController().navigate(R.id.salesDashboardFragment) }
        binding.viewFinancialButton.setOnClickListener { findNavController().navigate(R.id.financialDashboardFragment) }
        binding.editFarmButton.setOnClickListener { findNavController().navigate(R.id.editFarmFragment, android.os.Bundle().apply { putString("farmId", farmId) }) }
        viewLifecycleOwner.lifecycleScope.launch { repository.get(farmId).onSuccess { render(it) }.onFailure { binding.detailsState.text = "${it.message} Return to your farm list." } }
    }

    private fun render(farm: com.farmwise.app.data.models.FarmDto) {
        binding.detailsFarmName.text = farm.name
        binding.detailsFarmLocation.text = listOfNotNull(farm.region, farm.district, farm.country).joinToString(", ").ifBlank { "Location not provided" }
        binding.detailsFarmStatus.text = "Status: ${farm.status ?: "UNKNOWN"}"
        binding.detailsFarmCounts.text = "Fields: ${farm.counts?.fields ?: 0}   Members: ${farm.counts?.farmMembers ?: 0}"
        binding.detailsFarmDescription.text = farm.description ?: "No description provided."
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
