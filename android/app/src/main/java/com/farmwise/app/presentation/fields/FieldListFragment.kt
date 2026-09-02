package com.farmwise.app.presentation.fields

import android.os.Bundle
import android.view.View
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.FieldRepository
import com.farmwise.app.databinding.FragmentFieldListBinding
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class FieldListFragment : Fragment(R.layout.fragment_field_list) {
    private var _binding: FragmentFieldListBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: FieldViewModel
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentFieldListBinding.bind(view)
        viewModel = ViewModelProvider(this, FieldViewModelFactory(FieldRepository(NetworkModule.fieldApi(requireContext()), FarmContextStore(requireContext()))))[FieldViewModel::class.java]
        val adapter = FieldAdapter { field -> findNavController().navigate(R.id.fieldDetailsFragment, bundleOf("fieldId" to field.id)) }
        binding.fieldList.layoutManager = LinearLayoutManager(requireContext()); binding.fieldList.adapter = adapter
        binding.refreshFields.setOnRefreshListener { viewModel.load() }; binding.addFieldButton.setOnClickListener { findNavController().navigate(R.id.addFieldFragment) }
        viewLifecycleOwner.lifecycleScope.launch { viewModel.state.collect { state -> binding.refreshFields.isRefreshing = state is FieldUiState.Loading; when (state) { FieldUiState.Loading -> binding.fieldState.text = "Loading fields..."; FieldUiState.Empty -> { adapter.submitList(emptyList()); binding.emptyFieldState.visibility = View.VISIBLE }; is FieldUiState.Success -> { binding.emptyFieldState.visibility = View.GONE; adapter.submitList(state.fields); binding.fieldState.text = "${state.fields.size} field(s)" }; is FieldUiState.Error -> binding.fieldState.text = "${state.message} Pull to retry." } } }
        viewModel.load()
    }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
