package com.farmwise.app.presentation.livestock

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.LivestockRepository
import com.farmwise.app.databinding.FragmentBreedingListBinding
import kotlinx.coroutines.launch

class BreedingListFragment : Fragment(R.layout.fragment_breeding_list) {
    private var _binding: FragmentBreedingListBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentBreedingListBinding.bind(view); val id = requireArguments().getString("animalId").orEmpty(); val repo = LivestockRepository(NetworkModule.livestockApi(requireContext()), FarmContextStore(requireContext())); val adapter = BreedingAdapter(); binding.breedingList.layoutManager = LinearLayoutManager(requireContext()); binding.breedingList.adapter = adapter; binding.addBreedingButton.setOnClickListener { findNavController().navigate(R.id.addBreedingFragment, bundleOf("animalId" to id)) }; viewLifecycleOwner.lifecycleScope.launch { repo.breeding(id).onSuccess { adapter.submitList(it) }.onFailure { binding.breedingList.contentDescription = it.message } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
