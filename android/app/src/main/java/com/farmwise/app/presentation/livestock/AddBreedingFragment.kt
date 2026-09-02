package com.farmwise.app.presentation.livestock

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.livestock.BreedingDateCalculator
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateBreedingRequest
import com.farmwise.app.data.repository.LivestockRepository
import com.farmwise.app.databinding.FragmentAddBreedingBinding
import kotlinx.coroutines.launch
import java.time.LocalDate

class AddBreedingFragment : Fragment(R.layout.fragment_add_breeding) {
    private var _binding: FragmentAddBreedingBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddBreedingBinding.bind(view); val femaleId = requireArguments().getString("animalId").orEmpty(); val repo = LivestockRepository(NetworkModule.livestockApi(requireContext()), FarmContextStore(requireContext())); binding.matingDateInput.setOnFocusChangeListener { _, hasFocus -> if (!hasFocus) preview() }; binding.createBreedingButton.setOnClickListener { val male = binding.maleAnimalIdInput.text.toString().trim(); val date = binding.matingDateInput.text.toString().trim(); val parsed = runCatching { LocalDate.parse(date) }.getOrNull(); when { male.isBlank() -> binding.addBreedingState.text = "Male animal ID is required."; parsed == null -> binding.addBreedingState.text = "Enter a valid date as YYYY-MM-DD."; else -> { binding.createBreedingButton.isEnabled = false; viewLifecycleOwner.lifecycleScope.launch { repo.createBreeding(femaleId, CreateBreedingRequest(male, "MALE", date, "PLANNED", binding.breedingNotesInput.text.toString().trim().ifBlank { null })).onSuccess { findNavController().popBackStack() }.onFailure { binding.addBreedingState.text = it.message; binding.createBreedingButton.isEnabled = true } } } } }
    }
    private fun preview() { runCatching { LocalDate.parse(binding.matingDateInput.text.toString().trim()) }.onSuccess { binding.previewExpectedText.text = "UI estimate only: ${BreedingDateCalculator.expectedFarrowingDate(it)} (backend remains authoritative)" }.onFailure { binding.previewExpectedText.text = "" } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
