package com.farmwise.app.presentation.production

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateHarvestRequest
import com.farmwise.app.data.repository.ProductionRepository
import com.farmwise.app.databinding.FragmentAddHarvestBinding

class AddHarvestFragment : Fragment(R.layout.fragment_add_harvest) {
    private var _binding: FragmentAddHarvestBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentAddHarvestBinding.bind(view); val model = ViewModelProvider(this, ProductionViewModelFactory(ProductionRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))))[ProductionViewModel::class.java]; binding.saveHarvestButton.setOnClickListener { val cycle = binding.harvestCycleIdInput.text.toString().trim(); val quantity = binding.harvestQuantityInput.text.toString().toDoubleOrNull(); val unit = binding.harvestUnitInput.text.toString().trim().uppercase(); val date = binding.harvestDateInput.text.toString().trim(); val damage = binding.harvestDamageInput.text.toString().toDoubleOrNull(); when { cycle.isBlank() -> binding.addHarvestState.text = "Crop cycle is required."; quantity == null || quantity <= 0 -> binding.addHarvestState.text = "Quantity must be greater than zero."; unit.isBlank() || date.isBlank() -> binding.addHarvestState.text = "Unit and harvest date are required."; damage != null && (damage < 0 || damage > 100) -> binding.addHarvestState.text = "Damage percentage must be between 0 and 100."; else -> { binding.saveHarvestButton.isEnabled = false; model.createHarvest(CreateHarvestRequest(cycle, quantity, unit, date, binding.harvestGradeInput.text.toString().trim().ifBlank { null }, damage, binding.harvestNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addHarvestState.text = it; binding.saveHarvestButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
