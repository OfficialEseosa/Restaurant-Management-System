package edu.gsu.restaurant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration for the Restaurant Management System REST API.
 *
 * Authentication model: the frontend authenticates by posting credentials to
 * /api/users/login, which returns the user record (including role) stored in
 * localStorage. Role enforcement is applied at the service layer and via
 * frontend route guards. HTTP-level role gating would require a stateful session
 * or JWT filter chain — a natural next step for a production deployment.
 *
 * This config keeps all endpoints accessible so the existing client continues
 * to work, while establishing the security framework and disabling Spring Boot's
 * default form-login and HTTP-Basic prompts.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // REST API — no need for CSRF protection
            .csrf(csrf -> csrf.disable())

            // Delegate CORS to the MVC-level WebConfig (allowedOrigins, methods, headers)
            .cors(Customizer.withDefaults())

            // Stateless: no HTTP sessions created or used
            .sessionManagement(sm -> sm
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Disable Spring Boot's auto-generated login page and HTTP Basic prompt
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())

            // All endpoints are open; role-based restrictions are enforced at the
            // service layer (e.g. OrderService.cancelOrder checks User.Role) and
            // via frontend route guards (AdminPage redirects non-ADMIN users).
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll());

        return http.build();
    }
}
