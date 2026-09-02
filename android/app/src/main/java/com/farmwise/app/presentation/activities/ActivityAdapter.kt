package com.farmwise.app.presentation.activities

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.FarmActivityDto
import com.farmwise.app.databinding.ItemActivityBinding

class ActivityAdapter(private val onOpen: (FarmActivityDto) -> Unit) : RecyclerView.Adapter<ActivityAdapter.ActivityViewHolder>() {
    private val activities = mutableListOf<FarmActivityDto>()
    fun submitList(items: List<FarmActivityDto>) { activities.clear(); activities.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ActivityViewHolder(ItemActivityBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: ActivityViewHolder, position: Int) = holder.bind(activities[position])
    override fun getItemCount() = activities.size
    inner class ActivityViewHolder(private val binding: ItemActivityBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(activity: FarmActivityDto) { binding.activityTitle.text = activity.title; binding.activityTime.text = "${activity.activityDate}${activity.activityTime?.let { " • $it" } ?: ""}"; binding.activityContext.text = listOfNotNull(activity.fieldId, activity.cropCycleId, activity.livestockId).joinToString(" • ").ifBlank { activity.category }; binding.activityStatus.text = "${activity.status} • ${activity.priority}"; binding.root.setOnClickListener { onOpen(activity) } } }
}
