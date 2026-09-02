package com.farmwise.app.presentation.financial

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.FinancialRepository
import com.farmwise.app.databinding.FragmentExpenseBreakdownBinding
import kotlinx.coroutines.launch

class ExpenseBreakdownFragment : Fragment(R.layout.fragment_expense_breakdown) {
    private var _binding: FragmentExpenseBreakdownBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentExpenseBreakdownBinding.bind(view); val model = ViewModelProvider(this, FinancialViewModelFactory(FinancialRepository(NetworkModule.financialApi(requireContext()), FarmContextStore(requireContext()))))[FinancialViewModel::class.java]; val adapter = ExpenseBreakdownAdapter(); binding.breakdownList.layoutManager = LinearLayoutManager(requireContext()); binding.breakdownList.adapter = adapter; viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> when (state) { FinancialUiState.Loading -> binding.breakdownState.text = "Loading breakdown..."; FinancialUiState.Empty -> binding.breakdownState.text = "No expenses recorded."; is FinancialUiState.Error -> binding.breakdownState.text = state.message; is FinancialUiState.Success -> { adapter.submitList(state.expenses); binding.breakdownState.text = "Categories from the selected farm" } } } }; model.load() }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
