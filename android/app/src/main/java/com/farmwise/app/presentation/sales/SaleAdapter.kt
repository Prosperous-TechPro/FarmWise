package com.farmwise.app.presentation.sales

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.SaleDto
import com.farmwise.app.databinding.ItemSaleBinding

class SaleAdapter : RecyclerView.Adapter<SaleAdapter.SaleViewHolder>() {
    private val sales = mutableListOf<SaleDto>()
    fun submitList(items: List<SaleDto>) { sales.clear(); sales.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = SaleViewHolder(ItemSaleBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: SaleViewHolder, position: Int) = holder.bind(sales[position])
    override fun getItemCount() = sales.size
    class SaleViewHolder(private val binding: ItemSaleBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(sale: SaleDto) { binding.saleNumber.text = sale.saleNumber; binding.saleBuyer.text = "Buyer: ${sale.buyer ?: "Not recorded"} • ${sale.saleDate}"; binding.saleAmount.text = "${sale.currency} ${sale.totalAmount}"; binding.saleStatus.text = "${sale.status} • ${sale.paymentMethod}" } }
}
