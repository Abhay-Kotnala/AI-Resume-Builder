package com.airesume.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // A verified domain or default from Resend (Resend only allows free testing on
    // your verified domain or "onboarding@resend.dev" to a verified email)
    // For local testing without a domain, usually we test with
    // onboarding@resend.dev
    private static final String FROM_EMAIL = "ElevateAI <onboarding@resend.dev>";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public EmailService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Welcome Email to {}", toEmail);
            return;
        }

        String subject = "Welcome to ElevateAI \uD83D\uDE80";
        String firstName = name != null ? name.split(" ")[0] : "there";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      " +
                        "      <!-- Header Gradient -->" +
                        "      <div style=\"background:linear-gradient(135deg,#10b981 0%%,#3b82f6 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Elevate<span style=\"color:#a7f3d0;\">AI</span></h1>"
                        +
                        "        <p style=\"color:#d1fae5;margin:10px 0 0 0;font-size:16px;\">The AI Resume Builder that beats the ATS</p>"
                        +
                        "      </div>" +
                        "      " +
                        "      <!-- Content -->" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">Welcome aboard, %s! \uD83D\uDC4B</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          We're thrilled to have you here. ElevateAI reverses the exact algorithms companies use to filter candidates, giving you an unfair advantage in your job hunt."
                        +
                        "        </p>" +
                        "        " +
                        "        <div style=\"background-color:#f1f5f9;border-left:4px solid #10b981;padding:20px;border-radius:0 8px 8px 0;margin-bottom:30px;\">"
                        +
                        "          <h3 style=\"margin:0 0 10px 0;font-size:16px;color:#0f172a;\">Quick Start Checklist:</h3>"
                        +
                        "          <ul style=\"margin:0;padding-left:20px;color:#475569;line-height:1.6;\">" +
                        "            <li style=\"margin-bottom:8px;\"><strong>Check your score:</strong> Upload your current PDF to see how ATS systems read it.</li>"
                        +
                        "            <li style=\"margin-bottom:8px;\"><strong>Magic Wand:</strong> Click any bullet point in the builder to have AI rewrite it for impact.</li>"
                        +
                        "            <li><strong>Tailor up:</strong> Paste a job description to instantly re-focus your resume.</li>"
                        +
                        "          </ul>" +
                        "        </div>" +
                        "        " +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/dashboard\" style=\"display:inline-block;background-color:#10b981;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;box-shadow:0 4px 6px -1px rgba(16,185,129,0.2);\">"
                        +
                        "            Go to Dashboard &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "        " +
                        "        <p style=\"font-size:14px;line-height:1.6;color:#64748b;margin:0;border-top:1px solid #e2e8f0;padding-top:20px;\">"
                        +
                        "          Need help? Reply directly to this email or visit our <strong style=\"color:#10b981;\">Help Center</strong>."
                        +
                        "        </p>" +
                        "      </div>" +
                        "    </div>" +
                        "    " +
                        "    <!-- Footer -->" +
                        "    <div style=\"text-align:center;padding-top:20px;color:#94a3b8;font-size:12px;\">" +
                        "      &copy; 2026 ElevateAI. All rights reserved.<br>" +
                        "      San Francisco, CA" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendProUpgradeEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Pro Upgrade Email to {}", toEmail);
            return;
        }

        String subject = "You're upgraded to ElevateAI Pro! \uD83C\uDF1F";
        String firstName = name != null ? name.split(" ")[0] : "there";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      " +
                        "      <!-- Header Gradient (Pro Theme) -->" +
                        "      <div style=\"background:linear-gradient(135deg,#6366f1 0%%,#8b5cf6 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <div style=\"display:inline-block;background-color:rgba(255,255,255,0.2);padding:6px 14px;border-radius:20px;color:white;font-size:12px;font-weight:bold;letter-spacing:1px;margin-bottom:15px;text-transform:uppercase;\">Pro Member</div>"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Welcome to <span style=\"color:#c4b5fd;\">Pro</span></h1>"
                        +
                        "      </div>" +
                        "      " +
                        "      <!-- Content -->" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">You're officially unstoppable, %s! \uD83D\uDE80</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          Your payment was successful and your account has been instantly upgraded to ElevateAI Pro. The gloves are off—you now have access to our most powerful AI models."
                        +
                        "        </p>" +
                        "        " +
                        "        <table style=\"width:100%%;border-collapse:separate;border-spacing:0 15px;margin-bottom:30px;\">"
                        +
                        "          <tr>" +
                        "            <td style=\"padding:15px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;\">"
                        +
                        "              <strong style=\"color:#4f46e5;\">✨ Unlimited AI</strong><br>" +
                        "              <span style=\"color:#64748b;font-size:14px;\">Generate endless bullet points and perfect cover letters.</span>"
                        +
                        "            </td>" +
                        "          </tr>" +
                        "          <tr>" +
                        "            <td style=\"padding:15px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;\">"
                        +
                        "              <strong style=\"color:#4f46e5;\">\uD83C\uDFAF Job Tailor</strong><br>" +
                        "              <span style=\"color:#64748b;font-size:14px;\">Inject exact keywords from target JD's to bypass ATS gates.</span>"
                        +
                        "            </td>" +
                        "          </tr>" +
                        "          <tr>" +
                        "            <td style=\"padding:15px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;\">"
                        +
                        "              <strong style=\"color:#4f46e5;\">\uD83D\uDCE5 Unlimited Exports</strong><br>" +
                        "              <span style=\"color:#64748b;font-size:14px;\">Download sharp PDFs and raw DOCX files instantly.</span>"
                        +
                        "            </td>" +
                        "          </tr>" +
                        "        </table>" +
                        "        " +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/dashboard\" style=\"display:inline-block;background-color:#6366f1;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;box-shadow:0 4px 6px -1px rgba(99,102,241,0.2);\">"
                        +
                        "            Access Pro Features &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "        " +
                        "        <p style=\"font-size:14px;line-height:1.6;color:#64748b;margin:0;border-top:1px solid #e2e8f0;padding-top:20px;\">"
                        +
                        "          A premium invoice has been generated separately via Stripe. To manage your subscription, visit your Profile settings."
                        +
                        "        </p>" +
                        "      </div>" +
                        "    </div>" +
                        "    " +
                        "    <!-- Footer -->" +
                        "    <div style=\"text-align:center;padding-top:20px;color:#94a3b8;font-size:12px;\">" +
                        "      &copy; 2026 ElevateAI. All rights reserved.<br>" +
                        "      San Francisco, CA" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendReferralSuccessEmail(String toEmail, String referrerName, String referredName) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Referral Email to {}", toEmail);
            return;
        }

        String subject = "You just earned 7 days of Pro! \uD83C\uDF89";
        String firstName = referrerName != null ? referrerName.split(" ")[0] : "there";
        String friendName = referredName != null ? referredName : "your friend";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      <div style=\"background:linear-gradient(135deg,#f59e0b 0%%,#ea580c 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Bonus Unlocked!</h1>"
                        +
                        "      </div>" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">Great news, %s!</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          %s just signed up using your link! As a thank you, we've instantly added <strong>7 free days of ElevateAI Pro</strong> to both of your accounts."
                        +
                        "        </p>" +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/dashboard\" style=\"display:inline-block;background-color:#f59e0b;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;\">"
                        +
                        "            Use Your Pro Features &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "      </div>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, friendName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendProExpiringEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Expiring Email to {}", toEmail);
            return;
        }

        String subject = "Your ElevateAI Pro access expires soon \u23F3";
        String firstName = name != null ? name.split(" ")[0] : "there";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      <div style=\"background:linear-gradient(135deg,#ef4444 0%%,#b91c1c 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Pro Expiring Soon</h1>"
                        +
                        "      </div>" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">Hi %s,</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          Your ElevateAI Pro access expires in exactly 3 days. Don't lose access to unlimited AI rewrites, job tailoring, and premium templates."
                        +
                        "        </p>" +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/profile\" style=\"display:inline-block;background-color:#ef4444;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;\">"
                        +
                        "            Renew Now &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "      </div>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendInactiveUserEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Inactive Email to {}", toEmail);
            return;
        }

        String subject = "Are you missing out on interviews? \uD83D\uDC40";
        String firstName = name != null ? name.split(" ")[0] : "there";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      <div style=\"background:linear-gradient(135deg,#3b82f6 0%%,#2563eb 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Let's Get Hired</h1>"
                        +
                        "      </div>" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">Hey %s,</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          We haven't seen you around in a bit. Check your ATS score now so that you aren't leaving potential interviews on the table. Try out our built-in Job Match tool to tailor your resume directly to your dream job."
                        +
                        "        </p>" +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/dashboard\" style=\"display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;\">"
                        +
                        "            Boost Your Resume &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "      </div>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendNewTemplateEmail(String toEmail, String name) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking New Template Email to {}", toEmail);
            return;
        }

        String subject = "New Premium Templates Available! \uD83C\uDFA8";
        String firstName = name != null ? name.split(" ")[0] : "there";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#1e293b;\">"
                        +
                        "  <div style=\"width:100%%;background-color:#0f172a;padding:40px 0;\">" +
                        "    <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);\">"
                        +
                        "      <div style=\"background:linear-gradient(135deg,#ec4899 0%%,#db2777 100%%);padding:40px 30px;text-align:center;\">"
                        +
                        "        <h1 style=\"color:#ffffff;margin:0;font-size:32px;letter-spacing:-0.5px;\">Fresh Designs</h1>"
                        +
                        "      </div>" +
                        "      <div style=\"padding:40px 30px;\">" +
                        "        <h2 style=\"margin:0 0 20px 0;font-size:24px;font-weight:700;color:#0f172a;\">Stand out, %s.</h2>"
                        +
                        "        <p style=\"font-size:16px;line-height:1.6;margin-bottom:24px;color:#475569;\">" +
                        "          We just dropped 3 new premium resume templates designed by entirely new HR professionals. Upgrade to Pro if you haven't already and catch recruiter attention!"
                        +
                        "        </p>" +
                        "        <div style=\"text-align:center;margin:40px 0;\">" +
                        "          <a href=\"%s/builder\" style=\"display:inline-block;background-color:#ec4899;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:8px;\">"
                        +
                        "            View Templates &rarr;" +
                        "          </a>" +
                        "        </div>" +
                        "      </div>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                firstName, frontendUrl);

        sendEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendFeedbackEmail(String userEmail, String message, Integer rating) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("your_resend_api_key_here")) {
            logger.warn("Resend API key missing. Mocking Feedback Email from {}", userEmail);
            return;
        }

        String subject = "New Feedback Received! ⭐ " + rating + "/5";

        // We'll send it to the admin (you can change this to your actual email)
        String adminEmail = "knightking2905@gmail.com";

        String htmlBody = String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<body style=\"font-family:sans-serif;color:#333;line-height:1.6;\">" +
                        "  <h2>New Feedback Submission</h2>" +
                        "  <p><strong>From:</strong> %s</p>" +
                        "  <p><strong>Rating:</strong> %d / 5</p>" +
                        "  <div style=\"background-color:#f4f4f4;padding:15px;border-left:4px solid #10b981;margin-top:20px;\">"
                        +
                        "    <p style=\"margin:0;\">%s</p>" +
                        "  </div>" +
                        "</body>" +
                        "</html>",
                userEmail, rating, message.replace("\n", "<br>"));

        sendEmail(adminEmail, subject, htmlBody);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", FROM_EMAIL);
            requestBody.put("to", new String[] { to });
            requestBody.put("subject", subject);
            requestBody.put("html", html);

            String requestJson = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Email sent successfully to: {}", to);
            } else {
                logger.error("Failed to send email to {}. Response: {}", to, response.getBody());
            }
        } catch (Exception e) {
            logger.error("Error occurred while sending email to {}: {}", to, e.getMessage(), e);
        }
    }
}
