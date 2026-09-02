package com.farmwise.app.presentation.common

import android.view.View
import android.widget.TextView

fun showState(view: View, message: String) {
    if (view is TextView) view.text = message
    view.visibility = View.VISIBLE
}
