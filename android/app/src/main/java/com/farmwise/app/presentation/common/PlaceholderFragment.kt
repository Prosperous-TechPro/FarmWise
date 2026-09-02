package com.farmwise.app.presentation.common

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import com.farmwise.app.R
import com.farmwise.app.databinding.FragmentPlaceholderBinding

class PlaceholderFragment : Fragment(R.layout.fragment_placeholder) {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        FragmentPlaceholderBinding.bind(view).titleText.text = arguments?.getString("title") ?: getString(R.string.module_ready)
    }
}
