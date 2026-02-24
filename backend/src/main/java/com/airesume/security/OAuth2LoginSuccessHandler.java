package com.airesume.security;

import com.airesume.entity.User;
import com.airesume.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

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
            // LinkedIn's email and name structure can be more complex depending on the
            // requested scopes
            email = (String) attributes.get("email");
            name = (String) attributes.get("localizedFirstName") + " " + attributes.get("localizedLastName");
            providerId = (String) attributes.get("id");
            profilePictureUrl = (String) attributes.get("profilePicture"); // Might require nested parsing based on
                                                                           // LinkedIn API version
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
            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(provider)
                    .providerId(providerId)
                    .profilePictureUrl(profilePictureUrl)
                    .build();
            userRepository.save(user);
        }

        // 2. Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        // 3. Redirect to frontend with Token
        // Adjust this URL to match your frontend port & OAuth2 Callback route
        String frontendUrl = "http://localhost:5173/oauth2/callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
