package com.farmwise.app.presentation.inventory

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.ReceiveInventoryRequest
import com.farmwise.app.data.repository.InventoryRepository
import com.farmwise.app.databinding.FragmentReceiveStockBinding

class ReceiveStockFragment : Fragment(R.layout.fragment_receive_stock) {
    private var _binding: FragmentReceiveStockBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentReceiveStockBinding.bind(view); val model = ViewModelProvider(this, InventoryTransactionViewModelFactory(InventoryRepository(NetworkModule.inventoryApi(requireContext()), FarmContextStore(requireContext()))))[InventoryTransactionViewModel::class.java]; binding.receiveStockButton.setOnClickListener { val item = binding.receiveItemIdInput.text.toString().trim(); val location = binding.receiveLocationIdInput.text.toString().trim(); val quantity = binding.receiveQuantityInput.text.toString().toDoubleOrNull(); val unit = binding.receiveUnitInput.text.toString().trim().uppercase(); val date = binding.receiveDateInput.text.toString().trim(); val unitCost = binding.receiveUnitCostInput.text.toString().toDoubleOrNull(); val totalCost = binding.receiveTotalCostInput.text.toString().toDoubleOrNull(); when { item.isBlank() || location.isBlank() -> binding.receiveStockState.text = "Item and storage location are required."; quantity == null || quantity <= 0 -> binding.receiveStockState.text = "Quantity must be greater than zero."; unit.isBlank() || date.isBlank() -> binding.receiveStockState.text = "Unit and received date are required."; unitCost != null && unitCost < 0 || totalCost != null && totalCost < 0 -> binding.receiveStockState.text = "Cost cannot be negative."; unitCost != null && totalCost != null && kotlin.math.abs(quantity * unitCost - totalCost) > 0.01 -> binding.receiveStockState.text = "Total cost must equal quantity multiplied by unit cost."; else -> { binding.receiveStockButton.isEnabled = false; model.receive(ReceiveInventoryRequest(item, location, quantity, unit, date, unitCost, totalCost, binding.receiveBatchInput.text.toString().trim().ifBlank { null }, binding.receiveExpiryInput.text.toString().trim().ifBlank { null }, null, null), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.receiveStockState.text = it; binding.receiveStockButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
