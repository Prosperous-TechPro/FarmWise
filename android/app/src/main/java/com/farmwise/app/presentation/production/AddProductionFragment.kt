package com.farmwise.app.presentation.production

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateProductionRequest
import com.farmwise.app.data.repository.ProductionRepository
import com.farmwise.app.databinding.FragmentAddProductionBinding

class AddProductionFragment : Fragment(R.layout.fragment_add_production) {
    private var _binding: FragmentAddProductionBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentAddProductionBinding.bind(view); val model = ViewModelProvider(this, ProductionViewModelFactory(ProductionRepository(NetworkModule.cropApi(requireContext()), FarmContextStore(requireContext()))))[ProductionViewModel::class.java]; binding.saveProductionButton.setOnClickListener { val product = binding.productionProductInput.text.toString().trim(); val quantity = binding.productionQuantityInput.text.toString().toDoubleOrNull(); val unit = binding.productionUnitInput.text.toString().trim().uppercase(); val date = binding.productionDateInput.text.toString().trim(); when { product.isBlank() -> binding.addProductionState.text = "Product is required."; quantity == null || quantity <= 0 -> binding.addProductionState.text = "Quantity must be greater than zero."; unit.isBlank() || date.isBlank() -> binding.addProductionState.text = "Unit and production date are required."; else -> { binding.saveProductionButton.isEnabled = false; model.createProduction(CreateProductionRequest(product, quantity, unit, date, binding.productionCycleInput.text.toString().trim().ifBlank { null }, binding.productionNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addProductionState.text = it; binding.saveProductionButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
