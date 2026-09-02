package com.farmwise.app.data.models

import com.google.gson.annotations.SerializedName

data class FarmDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val region: String? = null,
    val district: String? = null,
    val country: String? = null,
    val status: String? = null,
    @SerializedName("_count") val counts: FarmCounts? = null,
)

data class FarmCounts(val farmMembers: Int = 0, val fields: Int = 0)
data class CreateFarmRequest(
    val name: String,
    val description: String? = null,
    val region: String? = null,
    val district: String? = null,
    val country: String? = null,
)
data class UpdateFarmRequest(
    val name: String? = null,
    val description: String? = null,
    val region: String? = null,
    val district: String? = null,
    val country: String? = null,
    val status: String? = null,
)
