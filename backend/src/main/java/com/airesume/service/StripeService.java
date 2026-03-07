package com.airesume.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.model.CustomerCollection;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.Customer;
import com.airesume.entity.StripeEventLog;
import com.airesume.repository.StripeEventLogRepository;
import com.airesume.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class StripeService {

    private final UserRepository userRepository;
    private final StripeEventLogRepository stripeEventLogRepository;
    private final EmailService emailService;

    public StripeService(UserRepository userRepository, StripeEventLogRepository stripeEventLogRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.stripeEventLogRepository = stripeEventLogRepository;
        this.emailService = emailService;
    }

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

    public String createCheckoutSession(String userEmail, String plan) throws StripeException {
        // Build a Stripe Checkout Session
        // This generates a secure, hosted payment page URL for ElevateAI Pro
        String priceId = "annual".equalsIgnoreCase(plan) ? "price_annual_placeholder"
                : "price_1T43xYHxyGtws4fLuYsO5s0q";

        SessionCreateParams params = SessionCreateParams.builder()
                .setCustomerEmail(userEmail)
                .setClientReferenceId(userEmail)
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(frontendUrl + "/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/pricing")
                .setPaymentMethodCollection(SessionCreateParams.PaymentMethodCollection.ALWAYS)
                .setSubscriptionData(SessionCreateParams.SubscriptionData.builder()
                        .setTrialPeriodDays(7L)
                        .build())
                .setCustomText(SessionCreateParams.CustomText.builder()
                        .setSubmit(SessionCreateParams.CustomText.Submit.builder()
                                .setMessage("Unlock Unlimited Resume AI & Pro Cover Letters Today")
                                .build())
                        .build())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                // In production, replace this with your actual Stripe Price ID
                                // e.g., price_1NxyzABCDEF...
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public String createPortalSession(String userEmail) throws StripeException {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("email", userEmail);
        params.put("limit", 1);
        CustomerCollection customers = Customer.list(params);

        if (customers.getData().isEmpty()) {
            throw new RuntimeException("Stripe customer not found for email: " + userEmail);
        }

        String customerId = customers.getData().get(0).getId();
        com.stripe.param.billingportal.SessionCreateParams portalParams = com.stripe.param.billingportal.SessionCreateParams
                .builder()
                .setCustomer(customerId)
                .setReturnUrl(frontendUrl + "/profile")
                .build();

        com.stripe.model.billingportal.Session portalSession = com.stripe.model.billingportal.Session
                .create(portalParams);
        return portalSession.getUrl();
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        try {
            // Verify the webhook genuinely came from Stripe
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // 1. Idempotency Check: Have we already processed this exact event?
            // If Stripe retries a webhook due to network jitter, we don't want to
            // double-process.
            if (stripeEventLogRepository.existsById(event.getId())) {
                log.info("Stripe Webhook {} already processed. Ignoring duplicate.", event.getId());
                return;
            }

            // Handle the specific event
            switch (event.getType()) {
                case "checkout.session.completed":
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session == null)
                        break;

                    String emailToUpgrade = session.getClientReferenceId();
                    if (emailToUpgrade == null) {
                        emailToUpgrade = session.getCustomerEmail();
                    }
                    if (emailToUpgrade == null) {
                        log.warn("Checkout Session {} completed, but no accessible user email found.", session.getId());
                        break;
                    }

                    final String finalUpgradeEmail = emailToUpgrade;
                    userRepository.findByEmail(emailToUpgrade).ifPresentOrElse(user -> {
                        user.setPro(true);
                        userRepository.save(user);
                        log.info("✅ Assigned ElevateAI Pro Tier to upgrade email: {}", user.getEmail());

                        // Send Pro upgrade welcome email
                        emailService.sendProUpgradeEmail(user.getEmail(), user.getName());
                    }, () -> {
                        log.error("Stripe payment succeeded, but user {} could not be found in DB.", finalUpgradeEmail);
                    });

                    break;

                case "customer.subscription.deleted":
                    // This event triggers when a subscription is canceled or ends.
                    Object stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);
                    if (stripeObject instanceof com.stripe.model.Subscription) {
                        com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) stripeObject;

                        try {
                            // Retrieve customer email directly via Stripe API using the Customer ID
                            Customer customer = Customer.retrieve(subscription.getCustomer());
                            String customerEmail = customer.getEmail();

                            if (customerEmail != null) {
                                userRepository.findByEmail(customerEmail).ifPresentOrElse(user -> {
                                    user.setPro(false);
                                    userRepository.save(user);
                                    log.info("🛑 Downgraded ElevateAI Pro Tier for canceled user: {}", user.getEmail());
                                }, () -> {
                                    log.warn("Subscription deleted, but user {} not found in DB.", customerEmail);
                                });
                            }
                        } catch (StripeException e) {
                            log.error("Failed to retrieve customer data from Stripe for Subscription: {}",
                                    subscription.getId(), e);
                            throw new RuntimeException("Stripe API failed during subscription deletion lookup", e);
                        }
                    }
                    break;

                case "invoice.paid":
                    // This event triggers when a subscription is renewed
                    Object invoiceObj = event.getDataObjectDeserializer().getObject().orElse(null);
                    if (invoiceObj instanceof com.stripe.model.Invoice) {
                        com.stripe.model.Invoice invoice = (com.stripe.model.Invoice) invoiceObj;
                        String customerEmail = invoice.getCustomerEmail();
                        if (customerEmail != null) {
                            userRepository.findByEmail(customerEmail).ifPresentOrElse(user -> {
                                user.setPro(true);
                                user.setProEndDate(LocalDateTime.now().plusMonths(1));
                                userRepository.save(user);
                                log.info("✅ Renewed ElevateAI Pro Tier for user: {}", user.getEmail());
                            }, () -> log.warn("Invoice paid, but user {} not found in DB.", customerEmail));
                        }
                    }
                    break;

                case "invoice.payment_failed":
                    log.warn("❌ Stripe Sub. Payment Failed. Waiting for Stripe auto-retry logic or cancellation.");
                    break;
                default:
                    log.debug("Unhandled Stripe event type: {}", event.getType());
            }

            // 2. Mark event as processed in the database (ensured by @Transactional)
            StripeEventLog eventLog = StripeEventLog.builder()
                    .eventId(event.getId())
                    .eventType(event.getType())
                    .processedAt(LocalDateTime.now())
                    .build();
            stripeEventLogRepository.save(eventLog);

        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature detected. Someone may be trying to spoof the webhook.", e);
            throw new IllegalArgumentException("Invalid Stripe signature", e);
        } catch (Exception e) {
            log.error("Error processing Stripe Webhook: {}", payload, e);
            throw new RuntimeException("Internal Error processing webhook", e); // Propagates 500 so Stripe retries
        }
    }
}
