package com.farmwise.app.presentation.activities

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateActivityRequest
import com.farmwise.app.data.repository.ActivityRepository
import com.farmwise.app.databinding.FragmentAddActivityBinding

class AddActivityFragment : Fragment(R.layout.fragment_add_activity) {
    private var _binding: FragmentAddActivityBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddActivityBinding.bind(view)
        val model = ViewModelProvider(this, ActivityViewModelFactory(ActivityRepository(NetworkModule.activityApi(requireContext()), FarmContextStore(requireContext()))))[ActivityViewModel::class.java]
        binding.saveActivityButton.setOnClickListener {
            val title = binding.activityTitleInput.text.toString().trim(); val description = binding.activityDescriptionInput.text.toString().trim(); val category = binding.activityCategoryInput.text.toString().trim().uppercase(); val date = binding.activityDateInput.text.toString().trim(); val quantity = binding.activityQuantityInput.text.toString().toDoubleOrNull(); val cost = binding.activityCostInput.text.toString().toDoubleOrNull()
            when { title.isBlank() -> binding.addActivityState.text = "Activity title is required."; description.isBlank() -> binding.addActivityState.text = "Description is required."; category !in setOf("PLANTING", "WEEDING", "FERTILIZING", "SPRAYING", "WATERING", "HARVESTING", "FEEDING", "VACCINATION", "TREATMENT", "MAINTENANCE", "INSPECTION", "OTHER") -> binding.addActivityState.text = "Enter a valid activity category."; date.isBlank() -> binding.addActivityState.text = "Activity date is required."; quantity != null && quantity <= 0 -> binding.addActivityState.text = "Quantity must be greater than zero."; cost != null && cost < 0 -> binding.addActivityState.text = "Cost cannot be negative."; else -> { binding.saveActivityButton.isEnabled = false; binding.addActivityState.text = "Saving activity..."; model.create(CreateActivityRequest(title, description, category, "COMPLETED", "NORMAL", date, binding.activityTypeIdInput.text.toString().trim().ifBlank { null }, binding.activityFieldIdInput.text.toString().trim().ifBlank { null }, binding.activityAnimalIdInput.text.toString().trim().ifBlank { null }, binding.activityCropCycleIdInput.text.toString().trim().ifBlank { null }, quantity, binding.activityUnitInput.text.toString().trim().uppercase().ifBlank { null }, cost, binding.activityNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addActivityState.text = it; binding.saveActivityButton.isEnabled = true }) } }
        }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
