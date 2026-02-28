package com.airesume.config;

import com.airesume.security.HttpCookieOAuth2AuthorizationRequestRepository;
import com.airesume.security.JwtAuthenticationFilter;
import com.airesume.security.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final ClientRegistrationRepository clientRegistrationRepository;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .exceptionHandling(exceptions -> exceptions
                                                .defaultAuthenticationEntryPointFor(
                                                                new org.springframework.security.web.authentication.HttpStatusEntryPoint(
                                                                                org.springframework.http.HttpStatus.UNAUTHORIZED),
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/api/**")))
                                .authorizeHttpRequests(auth -> auth
                                                // Allow public access to error and static files
                                                .requestMatchers("/error", "/favicon.ico", "/images/**", "/static/**",
                                                                "/assets/**")
                                                .permitAll()
                                                // All /api/resume endpoints are currently open, allowing users to build
                                                // a
                                                // resume without logging in as requested originally.
                                                // You can secure them later by changing this to .authenticated() if you
                                                // want to
                                                // force sign-in for everything.
                                                .requestMatchers("/api/resume/**").authenticated()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(endpoint -> endpoint
                                                                .authorizationRequestResolver(
                                                                                customAuthorizationRequestResolver())
                                                                .authorizationRequestRepository(
                                                                                cookieAuthorizationRequestRepository()))
                                                .successHandler(oAuth2LoginSuccessHandler))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Value("${frontend.url:http://localhost:5173}")
        private String frontendUrl;

        private OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver() {
                DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(
                                clientRegistrationRepository, "/oauth2/authorization");

                resolver.setAuthorizationRequestCustomizer(builder -> {
                        builder.attributes(attributes -> {
                                String registrationId = (String) attributes.get(OAuth2ParameterNames.REGISTRATION_ID);
                                if ("linkedin".equalsIgnoreCase(registrationId)) {
                                        builder.additionalParameters(params -> params.remove("nonce"));
                                        attributes.remove("nonce");
                                }
                        });
                });

                return resolver;
        }

        @Bean
        public HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository() {
                return new HttpCookieOAuth2AuthorizationRequestRepository();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Allow local dev on both common Vite ports + configured production URL
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                frontendUrl));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
