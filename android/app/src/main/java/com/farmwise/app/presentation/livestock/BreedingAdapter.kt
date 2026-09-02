package com.farmwise.app.presentation.livestock

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.BreedingDto
import com.farmwise.app.databinding.ItemBreedingBinding

class BreedingAdapter : RecyclerView.Adapter<BreedingAdapter.BreedingViewHolder>() {
    private val records = mutableListOf<BreedingDto>()
    fun submitList(items: List<BreedingDto>) { records.clear(); records.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = BreedingViewHolder(ItemBreedingBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: BreedingViewHolder, position: Int) = holder.bind(records[position])
    override fun getItemCount() = records.size
    class BreedingViewHolder(private val binding: ItemBreedingBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(record: BreedingDto) { binding.breedingMating.text = "Mating: ${record.matingDate}"; binding.breedingExpected.text = "Estimated farrowing: ${record.expectedFarrowingDate ?: "Not calculated"}"; binding.breedingActual.text = "Actual farrowing: ${record.actualFarrowingDate ?: "Not recorded"}"; binding.breedingStatus.text = "Status: ${record.status}" } }
}
