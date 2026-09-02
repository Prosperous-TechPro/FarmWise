package com.farmwise.app.presentation.production

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.ProductionRepository
import com.farmwise.app.databinding.FragmentProductionDashboardBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class ProductionDashboardFragment : Fragment(R.layout.fragment_production_dashboard) {
    private var _binding: FragmentProductionDashboardBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentProductionDashboardBinding.bind(view); val model = ViewModelProvider(this, ProductionViewModelFactory(ProductionRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))))[ProductionViewModel::class.java]; val adapter = HarvestAdapter { findNavController().navigate(R.id.harvestDetailsFragment, bundleOf("harvestId" to it.id)) }; binding.harvestList.layoutManager = LinearLayoutManager(requireContext()); binding.harvestList.adapter = adapter; binding.addHarvestButton.setOnClickListener { findNavController().navigate(R.id.addHarvestFragment) }; binding.addProductionButton.setOnClickListener { findNavController().navigate(R.id.addProductionFragment) }; binding.refreshHarvests.setOnRefreshListener { model.load() }; viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshHarvests.isRefreshing = state is ProductionUiState.Loading; when (state) { ProductionUiState.Loading -> binding.productionState.text = "Loading production..."; ProductionUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyHarvestState.visibility = View.VISIBLE }; is ProductionUiState.Success -> { binding.emptyHarvestState.visibility = View.GONE; adapter.submitList(state.harvests); binding.productionSummaryText.text = "Harvest events: ${state.harvests.size} • Production records: ${state.production.size}" }; is ProductionUiState.Error -> binding.productionState.text = "${state.message} Pull to retry." } } }; model.load() }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
