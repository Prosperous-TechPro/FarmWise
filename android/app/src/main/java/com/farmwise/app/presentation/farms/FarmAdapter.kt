package com.farmwise.app.presentation.farms

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.FarmDto
import com.farmwise.app.databinding.ItemFarmBinding

class FarmAdapter(private val onOpen: (FarmDto) -> Unit) : RecyclerView.Adapter<FarmAdapter.FarmViewHolder>() {
    private val farms = mutableListOf<FarmDto>()

    fun submitList(items: List<FarmDto>) {
        farms.clear()
        farms.addAll(items)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FarmViewHolder = FarmViewHolder(ItemFarmBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: FarmViewHolder, position: Int) = holder.bind(farms[position])
    override fun getItemCount(): Int = farms.size

    inner class FarmViewHolder(private val binding: ItemFarmBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(farm: FarmDto) {
            binding.farmName.text = farm.name
            binding.farmLocation.text = listOfNotNull(farm.region, farm.district, farm.country).joinToString(", ").ifBlank { "Location not provided" }
            binding.farmStatus.text = "Status: ${farm.status ?: "UNKNOWN"}"
            binding.openFarmButton.setOnClickListener { onOpen(farm) }
        }
    }
}
