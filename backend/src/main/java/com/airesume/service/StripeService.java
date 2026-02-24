package com.airesume.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createCheckoutSession(String priceId) throws StripeException {
        // Build a Stripe Checkout Session
        // This generates a secure, hosted payment page URL for ElevateAI Pro ($19)
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(frontendUrl + "/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/pricing")
                .setPaymentMethodCollection(SessionCreateParams.PaymentMethodCollection.ALWAYS)
                .setCustomText(SessionCreateParams.CustomText.builder()
                        .setSubmit(SessionCreateParams.CustomText.Submit.builder()
                                .setMessage("Unlock Unlimited Resume AI & Pro Cover Letters Today")
                                .build())
                        .build())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                // In production, replace this with your actual Stripe Price ID
                                // e.g., price_1NxyzABCDEF...
                                .setPrice("price_1T43xYHxyGtws4fLuYsO5s0q")
                                .setQuantity(1L)
                                .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public void handleWebhook(String payload, String sigHeader) {
        try {
            // Verify the webhook genuinely came from Stripe
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // Handle the specific event
            switch (event.getType()) {
                case "checkout.session.completed":
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session == null)
                        break;
                    // Payment was successful!
                    // TODO: Lookup user by session.getCustomerEmail() or
                    // session.getClientReferenceId()
                    // TODO: Update their tier in the database from FREE to PRO
                    System.out.println("✅ Stripe Payment Success for user: " + session.getCustomerEmail());
                    break;
                case "invoice.payment_failed":
                    System.out.println("❌ Stripe Sub. Payment Failed");
                    // TODO: Handle failed recurring subscription payment (revoke access)
                    break;
                default:
                    System.out.println("Unhandled Stripe event type: " + event.getType());
            }

        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid Stripe signature", e);
        }
    }
}
