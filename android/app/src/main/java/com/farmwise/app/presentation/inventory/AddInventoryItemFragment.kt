package com.farmwise.app.presentation.inventory

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateInventoryItemRequest
import com.farmwise.app.data.repository.InventoryRepository
import com.farmwise.app.databinding.FragmentAddInventoryItemBinding

class AddInventoryItemFragment : Fragment(R.layout.fragment_add_inventory_item) {
    private var _binding: FragmentAddInventoryItemBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentAddInventoryItemBinding.bind(view); val model = ViewModelProvider(this, InventoryViewModelFactory(InventoryRepository(NetworkModule.inventoryApi(requireContext()), FarmContextStore(requireContext()))))[InventoryViewModel::class.java]; binding.saveInventoryItemButton.setOnClickListener { val name = binding.inventoryNameInput.text.toString().trim(); val category = binding.inventoryCategoryInput.text.toString().trim().uppercase(); val unit = binding.inventoryUnitInput.text.toString().trim().uppercase(); val minimum = binding.inventoryMinimumInput.text.toString().toDoubleOrNull(); val maximum = binding.inventoryMaximumInput.text.toString().toDoubleOrNull(); val categories = setOf("FEED", "SEEDS", "PLANTING_MATERIAL", "FERTILIZER", "HERBICIDE", "PESTICIDE", "FUNGICIDE", "MEDICATION", "VACCINE", "VETERINARY_SUPPLIES", "FUEL", "FARM_CHEMICAL", "PACKAGING", "CLEANING_SUPPLIES", "EQUIPMENT", "TOOLS", "SPARE_PARTS", "BUILDING_MATERIAL", "OTHER"); val units = setOf("KG", "GRAM", "LITRE", "MILLILITRE", "BAG", "SACK", "BOTTLE", "PACK", "BOX", "PIECE", "UNIT", "TON", "HECTARE", "ACRE", "DOSE", "OTHER"); when { name.isBlank() -> binding.addInventoryState.text = "Item name is required."; category !in categories -> binding.addInventoryState.text = "Enter a valid inventory category."; unit !in units -> binding.addInventoryState.text = "Enter a valid inventory unit."; minimum != null && minimum < 0 -> binding.addInventoryState.text = "Minimum stock cannot be negative."; maximum != null && maximum < 0 -> binding.addInventoryState.text = "Maximum stock cannot be negative."; minimum != null && maximum != null && maximum < minimum -> binding.addInventoryState.text = "Maximum stock cannot be less than minimum stock."; else -> { binding.saveInventoryItemButton.isEnabled = false; model.createItem(CreateInventoryItemRequest(name, category, unit, binding.inventoryDescriptionInput.text.toString().trim().ifBlank { null }, minimum, maximum, minimum), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addInventoryState.text = it; binding.saveInventoryItemButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
