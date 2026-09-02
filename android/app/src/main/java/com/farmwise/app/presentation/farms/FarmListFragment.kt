package com.farmwise.app.presentation.farms

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.core.os.bundleOf
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.FarmRepository
import com.farmwise.app.databinding.FragmentFarmListBinding
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.collect

class FarmListFragment : Fragment(R.layout.fragment_farm_list) {
    private var _binding: FragmentFarmListBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: FarmViewModel
    private lateinit var adapter: FarmAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentFarmListBinding.bind(view)
        val repository = FarmRepository(NetworkModule.farmApi(requireContext()), FarmContextStore(requireContext()))
        viewModel = ViewModelProvider(this, FarmViewModelFactory(repository))[FarmViewModel::class.java]
        adapter = FarmAdapter { farm -> viewModel.select(farm); findNavController().navigate(R.id.farmDetailsFragment, bundleOf("farmId" to farm.id)) }
        binding.farmList.layoutManager = LinearLayoutManager(requireContext())
        binding.farmList.adapter = adapter
        binding.refreshFarms.setOnRefreshListener { viewModel.load() }
        binding.addFarmButton.setOnClickListener { findNavController().navigate(R.id.addFarmFragment) }
        viewLifecycleOwner.lifecycleScope.launch { viewModel.state.collect { render(it) } }
        viewModel.load()
    }

    private fun render(state: FarmUiState) {
        binding.refreshFarms.isRefreshing = state is FarmUiState.Loading
        when (state) {
            FarmUiState.Loading -> binding.farmState.text = "Loading farms..."
            FarmUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyFarmState.visibility = View.VISIBLE; binding.farmState.text = "" }
            is FarmUiState.Success -> { binding.emptyFarmState.visibility = View.GONE; adapter.submitList(state.farms); binding.farmState.text = "${state.farms.size} farm(s) available" }
            is FarmUiState.Error -> { binding.emptyFarmState.visibility = View.GONE; binding.farmState.text = "${state.message} Pull to retry." }
        }
    }

    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
