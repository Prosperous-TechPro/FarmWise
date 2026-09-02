package com.farmwise.app.presentation.financial

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.farmwise.app.data.models.ExpenseBreakdownDto
import com.farmwise.app.databinding.ItemExpenseBreakdownBinding

class ExpenseBreakdownAdapter : RecyclerView.Adapter<ExpenseBreakdownAdapter.BreakdownViewHolder>() {
    private val rows = mutableListOf<ExpenseBreakdownDto>()
    fun submitList(items: List<ExpenseBreakdownDto>) { rows.clear(); rows.addAll(items); notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = BreakdownViewHolder(ItemExpenseBreakdownBinding.inflate(LayoutInflater.from(parent.context), parent, false))
    override fun onBindViewHolder(holder: BreakdownViewHolder, position: Int) = holder.bind(rows[position])
    override fun getItemCount() = rows.size
    class BreakdownViewHolder(private val binding: ItemExpenseBreakdownBinding) : RecyclerView.ViewHolder(binding.root) { fun bind(row: ExpenseBreakdownDto) { binding.expenseCategory.text = row.category; binding.expenseAmount.text = "${row.amount} (${row.records} records)" } }
}
