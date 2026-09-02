package com.farmwise.app.presentation.sales

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.farmwise.app.R
import com.farmwise.app.core.farm.FarmContextStore
import com.farmwise.app.core.network.NetworkModule
import com.farmwise.app.data.models.CreateSaleRequest
import com.farmwise.app.data.repository.SalesRepository
import com.farmwise.app.databinding.FragmentAddSaleBinding

class AddSaleFragment : Fragment(R.layout.fragment_add_sale) {
    private var _binding: FragmentAddSaleBinding? = null
    private val binding get() = _binding!!
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) { _binding = FragmentAddSaleBinding.bind(view); val model = ViewModelProvider(this, SalesViewModelFactory(SalesRepository(NetworkModule.salesApi(requireContext()), FarmContextStore(requireContext()))))[SalesViewModel::class.java]; binding.saveSaleButton.setOnClickListener { val number = binding.saleNumberInput.text.toString().trim(); val total = binding.saleTotalInput.text.toString().toDoubleOrNull(); val currency = binding.saleCurrencyInput.text.toString().trim().uppercase(); val payment = binding.salePaymentMethodInput.text.toString().trim().uppercase(); val status = binding.saleStatusInput.text.toString().trim().uppercase(); val date = binding.saleDateInput.text.toString().trim(); val currencies = setOf("GHS", "USD", "EUR"); val payments = setOf("CASH", "CARD", "MOBILE_MONEY", "BANK_TRANSFER", "CHEQUE", "OTHER"); val statuses = setOf("DRAFT", "CONFIRMED", "PAID", "CANCELLED", "VOIDED"); when { number.isBlank() -> binding.addSaleState.text = "Sale number is required."; total == null || total <= 0 -> binding.addSaleState.text = "Total amount must be greater than zero."; currency !in currencies -> binding.addSaleState.text = "Enter a valid currency."; payment !in payments -> binding.addSaleState.text = "Enter a valid payment method."; status !in statuses -> binding.addSaleState.text = "Enter a valid sale status."; date.isBlank() -> binding.addSaleState.text = "Sale date is required."; else -> { binding.saveSaleButton.isEnabled = false; model.create(CreateSaleRequest(number, total, currency, payment, status, binding.saleBuyerInput.text.toString().trim().ifBlank { null }, date, binding.saleNotesInput.text.toString().trim().ifBlank { null }), { requireActivity().onBackPressedDispatcher.onBackPressed() }, { binding.addSaleState.text = it; binding.saveSaleButton.isEnabled = true }) } } } }
    override fun onDestroyView() { _binding = null; super.onDestroyView() }
}
