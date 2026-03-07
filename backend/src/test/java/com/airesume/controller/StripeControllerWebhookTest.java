package com.airesume.controller;

import com.airesume.service.StripeService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StripeControllerWebhookTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StripeService stripeService;

    @Test
    void testWebhook_ValidPayload_ShouldReturn200() throws Exception {
        Mockito.doNothing().when(stripeService).handleWebhook(anyString(), anyString());

        mockMvc.perform(post("/api/stripe/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Stripe-Signature", "t=123,v1=abc")
                .content("{\"id\": \"evt_123\", \"type\": \"checkout.session.completed\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Webhook processed successfully"));
    }

    @Test
    void testWebhook_InvalidSignature_ShouldReturn400() throws Exception {
        doThrow(new IllegalArgumentException("Invalid Stripe signature"))
                .when(stripeService).handleWebhook(anyString(), anyString());

        mockMvc.perform(post("/api/stripe/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Stripe-Signature", "t=123,v1=bad_sig")
                .content("{\"id\": \"evt_123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Webhook error: Invalid Stripe signature"));
    }

    @Test
    void testWebhook_InternalError_ShouldReturn500ForRetry() throws Exception {
        doThrow(new RuntimeException("Database timeout"))
                .when(stripeService).handleWebhook(anyString(), anyString());

        mockMvc.perform(post("/api/stripe/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Stripe-Signature", "t=123,v1=abc")
                .content("{\"id\": \"evt_123\"}"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Internal Webhook error: Database timeout"));
    }
}
