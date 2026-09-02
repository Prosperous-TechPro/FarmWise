package com.farmwise.app.presentation.crops

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.CropCycleDto
import com.farmwise.app.databinding.ItemCropCycleBinding

class CropCycleAdapter(private val onOpen: (CropCycleDto) -> Unit) : RecyclerView.Adapter<CropCycleAdapter.CycleViewHolder>() {
    private val cycles = mutableListOf<CropCycleDto>()
    fun submitList(items: List<CropCycleDto>) { cycles.clear(); cycles.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = CycleViewHolder(ItemCropCycleBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: CycleViewHolder, position: Int) = holder.bind(cycles[position])
    override fun getItemCount() = cycles.size
    inner class CycleViewHolder(private val binding: ItemCropCycleBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(cycle: CropCycleDto) { binding.cycleName.text = cycle.cycleName ?: "Crop cycle"; binding.cycleCrop.text = cycle.crop?.name ?: "Crop ID: ${cycle.cropId}"; binding.cycleDates.text = "Planting: ${cycle.plantingDate ?: "Not recorded"}  Harvest: ${cycle.expectedHarvestDate ?: "Not set"}"; binding.cycleStatus.text = "Status: ${cycle.status}"; binding.openCycleButton.setOnClickListener { onOpen(cycle) } } }
}
