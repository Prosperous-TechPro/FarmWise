package com.farmwise.app.presentation.livestock

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.LivestockRepository
import com.farmwise.app.databinding.FragmentAnimalDetailsBinding
import kotlinx.coroutines.launch

class AnimalDetailsFragment : Fragment(R.layout.fragment_animal_details) {
    private var _binding: FragmentAnimalDetailsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAnimalDetailsBinding.bind(view); val id = requireArguments().getString("animalId").orEmpty(); val repo = LivestockRepository(NetworkModule.livestockApi(requireContext()), FarmContextStore(requireContext())); binding.viewBreedingButton.setOnClickListener { findNavController().navigate(R.id.breedingListFragment, bundleOf("animalId" to id)) }
        viewLifecycleOwner.lifecycleScope.launch { repo.get(id).onSuccess { animal -> binding.animalDetailsTag.text = animal.tagNumber; binding.animalDetailsBody.text = "${animal.species?.name ?: animal.speciesId}\nBreed: ${animal.breed?.name ?: "Not recorded"}\nSex: ${animal.sex ?: "Not recorded"}\nStatus: ${animal.status}\nBorn: ${animal.dateOfBirth ?: "Not recorded"}\nWeight: ${animal.currentWeight?.let { "$it ${animal.weightUnit ?: ""}" } ?: "Not recorded"}" }.onFailure { binding.animalDetailsState.text = it.message ?: "Animal is no longer available." } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
