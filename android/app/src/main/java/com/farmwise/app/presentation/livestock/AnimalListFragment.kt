package com.farmwise.app.presentation.livestock

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
import com.farmwise.app.data.repository.LivestockRepository
import com.farmwise.app.databinding.FragmentAnimalListBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class AnimalListFragment : Fragment(R.layout.fragment_animal_list) {
    private var _binding: FragmentAnimalListBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAnimalListBinding.bind(view); val model = ViewModelProvider(this, LivestockViewModelFactory(LivestockRepository(NetworkModule.livestockApi(requireContext()), FarmContextStore(requireContext()))))[LivestockViewModel::class.java]; val adapter = AnimalAdapter { findNavController().navigate(R.id.animalDetailsFragment, bundleOf("animalId" to it.id)) }
        binding.animalList.layoutManager = LinearLayoutManager(requireContext()); binding.animalList.adapter = adapter; binding.addAnimalButton.setOnClickListener { findNavController().navigate(R.id.addAnimalFragment) }; binding.refreshAnimals.setOnRefreshListener { model.load() }
        viewLifecycleOwner.lifecycleScope.launch { model.state.collect { state -> binding.refreshAnimals.isRefreshing = state is LivestockUiState.Loading; when (state) { LivestockUiState.Loading -> binding.animalState.text = "Loading livestock..."; LivestockUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyAnimalState.visibility = View.VISIBLE }; is LivestockUiState.Success -> { binding.emptyAnimalState.visibility = View.GONE; adapter.submitList(state.animals); binding.animalState.text = "${state.animals.size} animal(s)" }; is LivestockUiState.Error -> binding.animalState.text = "${state.message} Pull to retry." } } }; model.load()
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
