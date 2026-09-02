package com.farmwise.app.presentation.activities

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.repository.ActivityRepository
import com.farmwise.app.databinding.FragmentActivityDetailsBinding
import kotlinx.coroutines.launch

class ActivityDetailsFragment : Fragment(R.layout.fragment_activity_details) {
    private var _binding: FragmentActivityDetailsBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentActivityDetailsBinding.bind(view); val id = requireArguments().getString("activityId").orEmpty(); viewLifecycleOwner.lifecycleScope.launch { ActivityRepository(NetworkModule.activityApi(requireContext()), FarmContextStore(requireContext())).get(id).onSuccess { binding.activityDetailsTitle.text = it.title; binding.activityDetailsBody.text = "Date: ${it.activityDate}\nTime: ${it.activityTime ?: "Not recorded"}\nCategory: ${it.category}\nStatus: ${it.status}\nDescription: ${it.description}\nField: ${it.fieldId ?: "Not linked"}\nCrop cycle: ${it.cropCycleId ?: "Not linked"}\nAnimal: ${it.livestockId ?: "Not linked"}\nCost: ${it.cost ?: "Not recorded"}" }.onFailure { binding.activityDetailsState.text = it.message } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
