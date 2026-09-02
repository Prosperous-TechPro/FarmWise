package com.farmwise.app.presentation.fields

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.FieldRepository
import com.farmwise.app.databinding.FragmentFieldDetailsBinding
import kotlinx.coroutines.launch

class FieldDetailsFragment : Fragment(R.layout.fragment_field_details) {
    private var _binding: FragmentFieldDetailsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentFieldDetailsBinding.bind(view); val id = requireArguments().getString("fieldId").orEmpty(); val repo = FieldRepository(NetworkModule.fieldApi(requireContext()), FarmContextStore(requireContext()))
        binding.editFieldButton.setOnClickListener { findNavController().navigate(R.id.editFieldFragment, bundleOf("fieldId" to id)) }
        viewLifecycleOwner.lifecycleScope.launch { repo.get(id).onSuccess { binding.fieldDetailsName.text = it.name; binding.fieldDetailsArea.text = "Area: ${it.area} ${it.areaUnit}"; binding.fieldDetailsStatus.text = "Status: ${it.status}"; binding.fieldDetailsDescription.text = it.description ?: "No description provided." }.onFailure { binding.fieldDetailsState.text = it.message ?: "Field is no longer available." } }
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
