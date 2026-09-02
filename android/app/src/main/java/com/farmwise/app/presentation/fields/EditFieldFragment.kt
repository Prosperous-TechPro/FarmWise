package com.farmwise.app.presentation.fields

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.UpdateFieldRequest
import com.farmwise.app.data.repository.FieldRepository
import com.farmwise.app.databinding.FragmentEditFieldBinding
import kotlinx.coroutines.launch

class EditFieldFragment : Fragment(R.layout.fragment_edit_field) {
    private var _binding: FragmentEditFieldBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentEditFieldBinding.bind(view); val id = requireArguments().getString("fieldId").orEmpty(); val repo = FieldRepository(NetworkModule.fieldApi(requireContext()), FarmContextStore(requireContext()))
        viewLifecycleOwner.lifecycleScope.launch { repo.get(id).onSuccess { binding.editFieldNameInput.setText(it.name); binding.editFieldAreaInput.setText(it.area.toString()); binding.editFieldUnitInput.setText(it.areaUnit); binding.editFieldDescriptionInput.setText(it.description); binding.editFieldStatusInput.setText(it.status) }.onFailure { binding.editFieldState.text = it.message } }
        binding.saveFieldButton.setOnClickListener { val name = binding.editFieldNameInput.text.toString().trim(); val area = binding.editFieldAreaInput.text.toString().toDoubleOrNull(); val unit = binding.editFieldUnitInput.text.toString().trim().uppercase(); val status = binding.editFieldStatusInput.text.toString().trim().uppercase(); if (name.isBlank()) binding.editFieldState.text = "Field name is required." else if (area == null || area <= 0) binding.editFieldState.text = "Area must be greater than zero." else if (unit !in setOf("ACRE", "HECTARE", "SQUARE_METER", "SQUARE_KILOMETER")) binding.editFieldState.text = "Enter a valid area unit." else if (status !in setOf("ACTIVE", "INACTIVE", "ARCHIVED")) binding.editFieldState.text = "Enter a valid field status." else { binding.saveFieldButton.isEnabled = false; viewLifecycleOwner.lifecycleScope.launch { repo.update(id, UpdateFieldRequest(name, binding.editFieldDescriptionInput.text.toString().trim().ifBlank { null }, area, unit, status)).onSuccess { findNavController().popBackStack() }.onFailure { binding.editFieldState.text = it.message; binding.saveFieldButton.isEnabled = true } } } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
