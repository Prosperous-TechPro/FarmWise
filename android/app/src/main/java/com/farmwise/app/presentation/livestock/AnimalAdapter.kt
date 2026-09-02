package com.farmwise.app.presentation.livestock

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.LivestockDto
import com.farmwise.app.databinding.ItemAnimalBinding

class AnimalAdapter(private val onOpen: (LivestockDto) -> Unit) : RecyclerView.Adapter<AnimalAdapter.AnimalViewHolder>() {
    private val animals = mutableListOf<LivestockDto>()
    fun submitList(items: List<LivestockDto>) { animals.clear(); animals.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = AnimalViewHolder(ItemAnimalBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: AnimalViewHolder, position: Int) = holder.bind(animals[position])
    override fun getItemCount() = animals.size
    inner class AnimalViewHolder(private val binding: ItemAnimalBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(animal: LivestockDto) { binding.animalTag.text = animal.tagNumber; binding.animalSummary.text = "${animal.species?.name ?: animal.speciesId} • ${animal.sex ?: "Sex not recorded"} • ${animal.breed?.name ?: "Breed not recorded"}"; binding.animalStatus.text = "Status: ${animal.status}"; binding.openAnimalButton.setOnClickListener { onOpen(animal) } } }
}
