package com.farmwise.app.presentation.inventory

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.InventoryRepository
import com.farmwise.app.databinding.FragmentInventoryDashboardBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class InventoryDashboardFragment : Fragment(R.layout.fragment_inventory_dashboard) {
    private var _binding: FragmentInventoryDashboardBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentInventoryDashboardBinding.bind(view); val model = ViewModelProvider(this, InventoryViewModelFactory(InventoryRepository(NetworkModule.inventoryApi(requireContext()), FarmContextStore(requireContext()))))[InventoryViewModel::class.java]; val adapter = InventoryAdapter(); binding.inventoryList.layoutManager = LinearLayoutManager(requireContext()); binding.inventoryList.adapter = adapter; binding.addInventoryItemButton.setOnClickListener { findNavController().navigate(R.id.addInventoryItemFragment) }; binding.refreshInventory.setOnRefreshListener { model.load() }; viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshInventory.isRefreshing = state is InventoryUiState.Loading; when (state) { InventoryUiState.Loading -> binding.inventoryState.text = "Loading inventory..."; InventoryUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyInventoryState.visibility = View.VISIBLE }; is InventoryUiState.Success -> { binding.emptyInventoryState.visibility = View.GONE; adapter.submitList(state.items); val summary = state.summary; binding.inventorySummaryText.text = summary?.let { "Items: ${it.totalItems} • Receipts: ${it.totalReceipts} • Usage: ${it.totalIssues}" } ?: "Summary unavailable" }; is InventoryUiState.Error -> binding.inventoryState.text = "${state.message} Pull to retry." } } }; model.load() }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
