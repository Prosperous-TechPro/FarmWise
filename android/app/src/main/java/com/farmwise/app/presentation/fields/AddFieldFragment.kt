package com.farmwise.app.presentation.fields

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateFieldRequest
import com.farmwise.app.data.repository.FieldRepository
import com.farmwise.app.databinding.FragmentAddFieldBinding

class AddFieldFragment : Fragment(R.layout.fragment_add_field) {
    private var _binding: FragmentAddFieldBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentAddFieldBinding.bind(view)
        val model = ViewModelProvider(this, FieldViewModelFactory(FieldRepository(NetworkModule.fieldApi(requireContext()), FarmContextStore(requireContext()))))[FieldViewModel::class.java]
        binding.createFieldButton.setOnClickListener {
            val name = binding.fieldNameInput.text.toString().trim(); val area = binding.fieldAreaInput.text.toString().toDoubleOrNull(); val unit = binding.fieldUnitInput.text.toString().trim().uppercase()
            when { name.isBlank() -> binding.addFieldState.text = "Field name is required."; area == null || area <= 0 -> binding.addFieldState.text = "Area must be greater than zero."; unit !in setOf("ACRE", "HECTARE", "SQUARE_METER", "SQUARE_KILOMETER") -> binding.addFieldState.text = "Enter a valid area unit."; else -> { binding.createFieldButton.isEnabled = false; model.create(CreateFieldRequest(name, binding.fieldDescriptionInput.text.toString().trim().ifBlank { null }, area, unit)) { requireActivity().onBackPressedDispatcher.onBackPressed() } } }
        }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
