package com.farmwise.app.presentation.crops

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateCropCycleRequest
import com.farmwise.app.data.repository.CropRepository
import com.farmwise.app.databinding.FragmentAddCropCycleBinding

class AddCropCycleFragment : Fragment(R.layout.fragment_add_crop_cycle) {
    private var _binding: FragmentAddCropCycleBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddCropCycleBinding.bind(view); val model = ViewModelProvider(this, CropViewModelFactory(CropRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))))[CropViewModel::class.java]
        binding.createCycleButton.setOnClickListener { val field = binding.cycleFieldIdInput.text.toString().trim(); val crop = binding.cycleCropIdInput.text.toString().trim(); val area = binding.cycleAreaInput.text.toString().toDoubleOrNull(); val unit = binding.cycleAreaUnitInput.text.toString().trim().uppercase(); when { field.isBlank() -> binding.addCycleState.text = "Field is required."; crop.isBlank() -> binding.addCycleState.text = "Crop is required."; area == null || area <= 0 -> binding.addCycleState.text = "Area must be greater than zero."; unit !in setOf("ACRE", "HECTARE", "SQUARE_METER", "SQUARE_KILOMETER") -> binding.addCycleState.text = "Enter a valid area unit."; else -> { binding.createCycleButton.isEnabled = false; binding.addCycleState.text = "Creating crop cycle..."; model.createCycle(CreateCropCycleRequest(field, crop, binding.cycleNameInput.text.toString().trim().ifBlank { null }, binding.cycleSeasonInput.text.toString().trim().uppercase().ifBlank { null }, area, unit, binding.cyclePlantingDateInput.text.toString().trim().ifBlank { null }, binding.cycleExpectedHarvestInput.text.toString().trim().ifBlank { null }, binding.cycleNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addCycleState.text = it; binding.createCycleButton.isEnabled = true }) } } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
