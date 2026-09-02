package com.farmwise.app.presentation.livestock

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateLivestockRequest
import com.farmwise.app.data.repository.LivestockRepository
import com.farmwise.app.databinding.FragmentAddAnimalBinding

class AddAnimalFragment : Fragment(R.layout.fragment_add_animal) {
    private var _binding: FragmentAddAnimalBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddAnimalBinding.bind(view)
        val model = ViewModelProvider(this, LivestockViewModelFactory(LivestockRepository(NetworkModule.livestockApi(requireContext()), FarmContextStore(requireContext()))))[LivestockViewModel::class.java]
        binding.registerAnimalButton.setOnClickListener { val species = binding.animalSpeciesIdInput.text.toString().trim(); val tag = binding.animalTagInput.text.toString().trim(); val sex = binding.animalSexInput.text.toString().trim().uppercase(); val weight = binding.animalWeightInput.text.toString().toDoubleOrNull(); when { species.isBlank() -> binding.addAnimalState.text = "Species is required."; tag.isBlank() -> binding.addAnimalState.text = "Animal ID is required."; sex !in setOf("MALE", "FEMALE", "UNKNOWN") -> binding.addAnimalState.text = "Enter MALE, FEMALE, or UNKNOWN."; weight != null && weight <= 0 -> binding.addAnimalState.text = "Weight must be greater than zero."; else -> { binding.registerAnimalButton.isEnabled = false; model.create(CreateLivestockRequest(species, binding.animalBreedIdInput.text.toString().trim().ifBlank { null }, tag, binding.animalNameInput.text.toString().trim().ifBlank { null }, sex, binding.animalAcquisitionInput.text.toString().trim().uppercase().ifBlank { "BORN_ON_FARM" }, null, null, binding.animalBirthInput.text.toString().trim().ifBlank { null }, weight, "KILOGRAM", binding.animalNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addAnimalState.text = it; binding.registerAnimalButton.isEnabled = true }) } } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
