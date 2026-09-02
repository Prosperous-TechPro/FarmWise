package com.farmwise.app.presentation.dashboard

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.DashboardDto
import com.farmwise.app.data.models.DashboardOverviewDto
import com.farmwise.app.databinding.FragmentDashboardBinding
import kotlinx.coroutines.launch
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule

class DashboardFragment : Fragment(R.layout.fragment_dashboard) {
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentDashboardBinding.bind(view)
        binding.switchFarmButton.setOnClickListener { findNavController().navigate(R.id.farmsFragment) }
        loadDashboard()
    }

    private fun loadDashboard() {
        lifecycleScope.launch {
            val farmId = FarmContextStore(requireContext()).currentFarmId
            runCatching {
                val farm = farmId?.let { NetworkModule.farmApi(requireContext()).getFarm(it).data }
                binding.farmContextText.text = farm?.name ?: "All farms"
                if (farmId == null) {
                    NetworkModule.dashboardApi(requireContext()).overview().data
                } else {
                    NetworkModule.dashboardApi(requireContext()).farmDashboard(farmId).data
                }
            }
                .onSuccess { data ->
                    if (data is DashboardOverviewDto) renderOverview(data)
                    else renderFarm(data as DashboardDto?)
                }
                .onFailure { binding.stateText.text = getString(R.string.dashboard_error) }
        }
    }

    private fun renderOverview(data: DashboardOverviewDto?) {
        if (data == null) { binding.stateText.text = getString(R.string.dashboard_empty); return }
        val financial = data.financial
        binding.revenueText.text = financial?.revenue?.let { "Revenue  ${it}" } ?: "Financial details unavailable"
        binding.expensesText.text = financial?.expenses?.let { "Expenses  ${it}" } ?: "Expenses hidden"
        binding.profitText.text = financial?.let { "Net result  ${it.netProfit} (${it.status ?: "N/A"})" } ?: "Net result unavailable"
        binding.productionText.text = "Farms active  ${data.activeFarms} of ${data.totalFarms}"
        binding.tasksText.text = "Active tasks  ${data.activeTasks}   Alerts  ${data.activeAlerts}"
    }

    private fun renderFarm(data: DashboardDto?) {
        if (data == null) { binding.stateText.text = getString(R.string.dashboard_empty); return }
        val financial = data.financial
        binding.revenueText.text = financial?.let { "Revenue  ${it.revenue}" } ?: "Financial details unavailable"
        binding.expensesText.text = financial?.let { "Expenses  ${it.expenses}" } ?: "Expenses hidden"
        binding.profitText.text = financial?.let { "Net result  ${it.netProfit} (${it.status ?: "N/A"})" } ?: "Net result unavailable"
        binding.productionText.text = "Production records  ${data.production?.recordCount ?: 0}"
        binding.tasksText.text = "Tasks overdue  ${data.tasks?.overdue ?: 0}"
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
