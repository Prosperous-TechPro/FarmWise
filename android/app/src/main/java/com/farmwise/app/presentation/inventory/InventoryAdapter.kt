package com.farmwise.app.presentation.inventory

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.InventoryItemDto
import com.farmwise.app.databinding.ItemInventoryBinding

class InventoryAdapter : RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>() {
    private val items = mutableListOf<InventoryItemDto>()
    fun submitList(values: List<InventoryItemDto>) { items.clear(); items.addAll(values); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = InventoryViewHolder(ItemInventoryBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: InventoryViewHolder, position: Int) = holder.bind(items[position])
    override fun getItemCount() = items.size
    class InventoryViewHolder(private val binding: ItemInventoryBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(item: InventoryItemDto) { binding.inventoryItemName.text = item.name; binding.inventoryItemCategory.text = "${item.category} • ${item.unitOfMeasure}"; binding.inventoryItemLimits.text = "Minimum: ${item.minimumStockLevel ?: "Not set"}  Maximum: ${item.maximumStockLevel ?: "Not set"}" } }
}
