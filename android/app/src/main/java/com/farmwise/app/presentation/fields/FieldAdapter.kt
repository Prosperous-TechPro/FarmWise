package com.farmwise.app.presentation.fields

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.FieldDto
import com.farmwise.app.databinding.ItemFieldBinding

class FieldAdapter(private val onOpen: (FieldDto) -> Unit) : RecyclerView.Adapter<FieldAdapter.FieldViewHolder>() {
    private val fields = mutableListOf<FieldDto>()
    fun submitList(items: List<FieldDto>) { fields.clear(); fields.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = FieldViewHolder(ItemFieldBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: FieldViewHolder, position: Int) = holder.bind(fields[position])
    override fun getItemCount() = fields.size
    inner class FieldViewHolder(private val binding: ItemFieldBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(field: FieldDto) { binding.fieldName.text = field.name; binding.fieldArea.text = "Area: ${field.area} ${field.areaUnit}"; binding.fieldStatus.text = "Status: ${field.status}"; binding.openFieldButton.setOnClickListener { onOpen(field) } }
    }
}
