package com.farmwise.app.presentation.sales

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
import com.farmwise.app.data.repository.SalesRepository
import com.farmwise.app.databinding.FragmentSalesDashboardBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class SalesDashboardFragment : Fragment(R.layout.fragment_sales_dashboard) {
    private var _binding: FragmentSalesDashboardBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentSalesDashboardBinding.bind(view); val model = ViewModelProvider(this, SalesViewModelFactory(SalesRepository(NetworkModule.salesApi(requireContext()), FarmContextStore(requireContext()))))[SalesViewModel::class.java]; val adapter = SaleAdapter(); binding.salesList.layoutManager = LinearLayoutManager(requireContext()); binding.salesList.adapter = adapter; binding.addSaleButton.setOnClickListener { findNavController().navigate(R.id.addSaleFragment) }; binding.refreshSales.setOnRefreshListener { model.load() }; viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshSales.isRefreshing = state is SalesUiState.Loading; when (state) { SalesUiState.Loading -> binding.salesState.text = "Loading sales..."; SalesUiState.Empty -> { adapter.submitList(emptyList()); binding.emptySalesState.visibility = View.VISIBLE }; is SalesUiState.Success -> { binding.emptySalesState.visibility = View.GONE; adapter.submitList(state.sales); val total = state.sales.sumOf { it.totalAmount }; binding.salesSummaryText.text = "Sales: ${state.sales.size} • Recorded revenue: $total" }; is SalesUiState.Error -> binding.salesState.text = "${state.message} Pull to retry." } } }; model.load() }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
