package com.airesume.controller;

import com.airesume.service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@CrossOrigin(origins = "*")
public class StripeController {

    private final StripeService stripeService;

    public StripeController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            String userEmail = auth.getName();

            String checkoutUrl = stripeService.createCheckoutSession(userEmail);
            return ResponseEntity.ok(Map.of("url", checkoutUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}
