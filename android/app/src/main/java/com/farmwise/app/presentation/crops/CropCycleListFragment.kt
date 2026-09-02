package com.farmwise.app.presentation.crops

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
import com.farmwise.app.data.repository.CropRepository
import com.farmwise.app.databinding.FragmentCropCycleListBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class CropCycleListFragment : Fragment(R.layout.fragment_crop_cycle_list) {
    private var _binding: FragmentCropCycleListBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentCropCycleListBinding.bind(view); val model = ViewModelProvider(this, CropViewModelFactory(CropRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))))[CropViewModel::class.java]; val adapter = CropCycleAdapter { findNavController().navigate(R.id.cropCycleDetailsFragment, bundleOf("cycleId" to it.id)) }
        binding.cycleList.layoutManager = LinearLayoutManager(requireContext()); binding.cycleList.adapter = adapter; binding.addCycleButton.setOnClickListener { findNavController().navigate(R.id.addCropCycleFragment) }; binding.refreshCycles.setOnRefreshListener { model.load() }
        viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshCycles.isRefreshing = state is CropUiState.Loading; when (state) { CropUiState.Loading -> binding.cycleState.text = "Loading crop cycles..."; CropUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyCycleState.visibility = View.VISIBLE }; is CropUiState.Success -> { binding.emptyCycleState.visibility = View.GONE; adapter.submitList(state.cycles); binding.cycleState.text = "${state.cycles.size} crop cycle(s)" }; is CropUiState.Error -> binding.cycleState.text = "${state.message} Pull to retry." } } }; model.load()
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
