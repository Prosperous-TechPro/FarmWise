package com.farmwise.app.core.network

import android.content.Context
import com.farmwise.app.BuildConfig
import com.farmwise.app.core.security.TokenStore
import com.farmwise.app.data.api.AuthApi
import com.farmwise.app.data.api.DashboardApi
import com.farmwise.app.data.api.FarmApi
import com.farmwise.app.data.api.FieldApi
import com.farmwise.app.data.api.CropApi
import com.farmwise.app.data.api.SalesApi
import com.farmwise.app.data.api.NotificationApi
import com.farmwise.app.data.api.FinancialApi
import com.farmwise.app.data.api.LivestockApi
import com.farmwise.app.data.api.ActivityApi
import com.farmwise.app.data.api.InventoryApi
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AuthInterceptor(private val tokenStore: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
        tokenStore.accessToken?.let { request.addHeader("Authorization", "Bearer $it") }
        return chain.proceed(request.build())
    }
}

object NetworkModule {
    fun retrofit(context: Context): Retrofit {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(TokenStore(context.applicationContext)))
            .addInterceptor(logging)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun authApi(context: Context): AuthApi = retrofit(context).create(AuthApi::class.java)
    fun dashboardApi(context: Context): DashboardApi = retrofit(context).create(DashboardApi::class.java)
    fun farmApi(context: Context): FarmApi = retrofit(context).create(FarmApi::class.java)
    fun fieldApi(context: Context): FieldApi = retrofit(context).create(FieldApi::class.java)
    fun cropApi(context: Context): CropApi = retrofit(context).create(CropApi::class.java)
    fun livestockApi(context: Context): LivestockApi = retrofit(context).create(LivestockApi::class.java)
    fun activityApi(context: Context): ActivityApi = retrofit(context).create(ActivityApi::class.java)
    fun inventoryApi(context: Context): InventoryApi = retrofit(context).create(InventoryApi::class.java)
    fun salesApi(context: Context): SalesApi = retrofit(context).create(SalesApi::class.java)
    fun notificationApi(context: Context): NotificationApi = retrofit(context).create(NotificationApi::class.java)
    fun financialApi(context: Context): FinancialApi = retrofit(context).create(FinancialApi::class.java)
}
