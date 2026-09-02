package com.farmwise.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.farmwise.app.databinding.ActivityMainBinding
import com.farmwise.app.core.security.TokenStore

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        val navHost = supportFragmentManager.findFragmentById(R.id.nav_host) as NavHostFragment
        val navController = navHost.navController
        binding.bottomNavigation.setupWithNavController(navController)
        navController.addOnDestinationChangedListener { _, destination, _ ->
            binding.bottomNavigation.visibility = if (destination.id == R.id.loginFragment || destination.id == R.id.registerFragment || destination.id == R.id.otpFragment || destination.id == R.id.twoFactorFragment) android.view.View.GONE else android.view.View.VISIBLE
        }
        if (TokenStore(this).accessToken != null && savedInstanceState == null) {
            navController.navigate(R.id.dashboardFragment)
        }
    }
}
