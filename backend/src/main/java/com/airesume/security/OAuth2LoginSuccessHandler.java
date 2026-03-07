package com.airesume.security;

import com.airesume.entity.User;
import com.airesume.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.airesume.service.AnalyticsService;
import com.airesume.service.EmailService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import jakarta.servlet.http.Cookie;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AnalyticsService analyticsService;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String provider = oauthToken.getAuthorizedClientRegistrationId(); // e.g., "google", "linkedin"
        String email = "";
        String name = "";
        String providerId = "";
        String profilePictureUrl = "";

        if ("google".equalsIgnoreCase(provider)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            providerId = (String) attributes.get("sub");
            profilePictureUrl = (String) attributes.get("picture");
        } else if ("linkedin".equalsIgnoreCase(provider)) {
            // LinkedIn now uses standard OpenID Connect claims if "openid" scope is used
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            if (name == null || name.isBlank()) {
                name = attributes.get("given_name") + " " + attributes.get("family_name");
            }
            providerId = (String) attributes.get("sub");
            profilePictureUrl = (String) attributes.get("picture");
        }

        // 1. Check if user exists, otherwise create
        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            // Update provider/name if needed
            user.setName(name);
            user.setProfilePictureUrl(profilePictureUrl);
            userRepository.save(user);
        } else {
            // Generate a unique 8-char referral code
            String refCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // Check for referral cookie
            String referredByCode = null;
            boolean getsBonus = false;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("elevateAI_ref_code".equals(cookie.getName()) && cookie.getValue() != null
                            && !cookie.getValue().isBlank()) {
                        referredByCode = cookie.getValue();
                        break;
                    }
                }
            }

            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(provider)
                    .providerId(providerId)
                    .profilePictureUrl(profilePictureUrl)
                    .referralCode(refCode)
                    .referredBy(referredByCode)
                    .build();

            // Handle referral 7-day bonus
            if (referredByCode != null) {
                Optional<User> referrerOpt = userRepository.findByReferralCode(referredByCode);
                if (referrerOpt.isPresent()) {
                    User referrer = referrerOpt.get();
                    // Set both users to have +7 days of Pro
                    LocalDateTime bonusEnd = LocalDateTime.now().plusDays(7);

                    user.setProEndDate(bonusEnd);

                    referrer.setReferralCount(referrer.getReferralCount() + 1);
                    // Extend referrer's proEndDate if they already have one, or set a new one
                    if (referrer.getProEndDate() != null && referrer.getProEndDate().isAfter(LocalDateTime.now())) {
                        referrer.setProEndDate(referrer.getProEndDate().plusDays(7));
                    } else {
                        referrer.setProEndDate(bonusEnd);
                    }
                    userRepository.save(referrer);

                    // Send email nudge to the referrer
                    if (referrer.getEmail() != null) {
                        emailService.sendReferralSuccessEmail(referrer.getEmail(), referrer.getName(), user.getName());
                    }
                }
            }

            userRepository.save(user);

            // Log signup event
            analyticsService.logEvent(user.getId(), "SIGNUP",
                    "Provider: " + provider + (referredByCode != null ? " Ref: " + referredByCode : ""));

            // Send welcome email to new users
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        }

        // 2. Generate JWT with roles
        String token = jwtService.generateToken(user);

        // 3. Redirect to frontend with Token
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
