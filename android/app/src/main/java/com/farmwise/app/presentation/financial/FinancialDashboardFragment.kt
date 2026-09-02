package com.farmwise.app.presentation.financial

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.financial.FinancialStatus
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.FinancialRepository
import com.farmwise.app.databinding.FragmentFinancialDashboardBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class FinancialDashboardFragment : Fragment(R.layout.fragment_financial_dashboard) {
    private var _binding: FragmentFinancialDashboardBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentFinancialDashboardBinding.bind(view); val model = ViewModelProvider(this, FinancialViewModelFactory(FinancialRepository(NetworkModule.financialApi(requireContext()), FarmContextStore(requireContext()))))[FinancialViewModel::class.java]; binding.viewExpenseBreakdownButton.setOnClickListener { findNavController().navigate(R.id.expenseBreakdownFragment) }; viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> when (state) { FinancialUiState.Loading -> binding.financialState.text = "Loading financial data..."; FinancialUiState.Empty -> { binding.financialState.text = "No financial records yet. Record expenses and sales to see performance."; binding.financialStatus.text = "NO FINANCIAL ACTIVITY" }; is FinancialUiState.Error -> binding.financialState.text = state.message; is FinancialUiState.Success -> render(state) } } }; model.load() }
    private fun render(state: FinancialUiState.Success) { val summary = state.summary; val financial = state.backendFinancial; val status = FinancialStatus.resolve(summary.netProfit, summary.totalRevenue, financial?.status); binding.financialState.text = "Financial summary from the selected farm"; binding.financialStatus.text = status; binding.financialStatus.setTextColor(resources.getColor(when (status) { "LOSS" -> R.color.status_loss; "MANAGEABLE" -> R.color.status_manageable; "PROFIT" -> R.color.status_profit; else -> R.color.text_secondary }, null)); binding.financialRevenue.text = "Revenue: ${summary.totalRevenue}"; binding.financialExpenses.text = "Expenses: ${summary.totalExpenses}"; binding.financialNet.text = "Net result: ${summary.netProfit}"; binding.financialMargin.text = "Margin: ${financial?.profitMargin?.let { "$it%" } ?: "N/A"}" }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
