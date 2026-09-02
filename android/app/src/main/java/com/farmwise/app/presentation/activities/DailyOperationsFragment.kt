package com.farmwise.app.presentation.activities

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
import com.farmwise.app.data.repository.ActivityRepository
import com.farmwise.app.databinding.FragmentDailyOperationsBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class DailyOperationsFragment : Fragment(R.layout.fragment_daily_operations) {
    private var _binding: FragmentDailyOperationsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentDailyOperationsBinding.bind(view); val model = ViewModelProvider(this, ActivityViewModelFactory(ActivityRepository(NetworkModule.activityApi(requireContext()), FarmContextStore(requireContext()))))[ActivityViewModel::class.java]; val adapter = ActivityAdapter { findNavController().navigate(R.id.activityDetailsFragment, bundleOf("activityId" to it.id)) }
        binding.activityList.layoutManager = LinearLayoutManager(requireContext()); binding.activityList.adapter = adapter; binding.addActivityButton.setOnClickListener { findNavController().navigate(R.id.addActivityFragment) }; binding.refreshActivities.setOnRefreshListener { model.load() }
        viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshActivities.isRefreshing = state is ActivityUiState.Loading; when (state) { ActivityUiState.Loading -> binding.activityState.text = "Loading activities..."; ActivityUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyActivityState.visibility = View.VISIBLE }; is ActivityUiState.Success -> { binding.emptyActivityState.visibility = View.GONE; adapter.submitList(state.activities); binding.activityState.text = "${state.activities.size} activity record(s)" }; is ActivityUiState.Error -> binding.activityState.text = "${state.message} Pull to retry." } } }; model.load()
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
