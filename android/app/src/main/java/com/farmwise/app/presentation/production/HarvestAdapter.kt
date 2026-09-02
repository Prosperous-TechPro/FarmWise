package com.farmwise.app.presentation.production

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.HarvestDto
import com.farmwise.app.databinding.ItemHarvestBinding

class HarvestAdapter(private val onOpen: (HarvestDto) -> Unit) : RecyclerView.Adapter<HarvestAdapter.HarvestViewHolder>() {
    private val harvests = mutableListOf<HarvestDto>()
    fun submitList(items: List<HarvestDto>) { harvests.clear(); harvests.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = HarvestViewHolder(ItemHarvestBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: HarvestViewHolder, position: Int) = holder.bind(harvests[position])
    override fun getItemCount() = harvests.size
    inner class HarvestViewHolder(private val binding: ItemHarvestBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(harvest: HarvestDto) { binding.harvestCycle.text = "Crop cycle: ${harvest.cropCycleId}"; binding.harvestQuantity.text = "${harvest.quantity} ${harvest.quantityUnit}"; binding.harvestDate.text = harvest.harvestDate; binding.harvestQuality.text = "Grade: ${harvest.grade ?: "Not recorded"}"; binding.root.setOnClickListener { onOpen(harvest) } } }
}
