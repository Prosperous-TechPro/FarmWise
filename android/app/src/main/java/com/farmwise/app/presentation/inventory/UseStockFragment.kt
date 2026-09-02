package com.farmwise.app.presentation.inventory

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.IssueInventoryRequest
import com.farmwise.app.data.repository.InventoryRepository
import com.farmwise.app.databinding.FragmentUseStockBinding

class UseStockFragment : Fragment(R.layout.fragment_use_stock) {
    private var _binding: FragmentUseStockBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentUseStockBinding.bind(view); val model = ViewModelProvider(this, InventoryTransactionViewModelFactory(InventoryRepository(NetworkModule.inventoryApi(requireContext()), FarmContextStore(requireContext()))))[InventoryTransactionViewModel::class.java]; binding.useStockButton.setOnClickListener { val item = binding.useItemIdInput.text.toString().trim(); val location = binding.useLocationIdInput.text.toString().trim(); val quantity = binding.useQuantityInput.text.toString().toDoubleOrNull(); val unit = binding.useUnitInput.text.toString().trim().uppercase(); val date = binding.useDateInput.text.toString().trim(); val crop = binding.useCropCycleInput.text.toString().trim().ifBlank { null }; val livestock = binding.useLivestockInput.text.toString().trim().ifBlank { null }; val field = binding.useFieldInput.text.toString().trim().ifBlank { null }; val activity = binding.useActivityInput.text.toString().trim().ifBlank { null }; when { item.isBlank() || location.isBlank() -> binding.useStockState.text = "Item and storage location are required."; quantity == null || quantity <= 0 -> binding.useStockState.text = "Quantity must be greater than zero."; date.isBlank() -> binding.useStockState.text = "Issue date is required."; crop == null && livestock == null && field == null && activity == null -> binding.useStockState.text = "Select a crop, livestock, field, or activity allocation."; else -> { binding.useStockButton.isEnabled = false; model.issue(IssueInventoryRequest(item, location, quantity, unit, date, binding.useReasonInput.text.toString().trim().ifBlank { null }, crop, livestock, field, activity, null), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.useStockState.text = it; binding.useStockButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
