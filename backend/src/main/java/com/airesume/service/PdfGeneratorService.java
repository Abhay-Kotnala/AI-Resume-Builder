package com.airesume.service;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.Margin;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;

@Service
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;
    private final AnalyticsService analyticsService;
    private Playwright playwright;
    private Browser browser;

    public PdfGeneratorService(TemplateEngine templateEngine, AnalyticsService analyticsService) {
        this.templateEngine = templateEngine;
        this.analyticsService = analyticsService;
    }

    @PostConstruct
    public void init() {
        this.playwright = Playwright.create();
        this.browser = playwright.chromium().launch();
    }

    @PreDestroy
    public void cleanup() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    public byte[] generatePdfFromRawHtml(String htmlContent) throws Exception {
        try (Page page = browser.newPage()) {
            page.setContent(htmlContent);
            return page.pdf(new Page.PdfOptions()
                    .setFormat("A4")
                    .setPrintBackground(true)
                    .setMargin(new Margin()
                            .setTop("0")
                            .setRight("0")
                            .setBottom("0")
                            .setLeft("0")));
        }
    }

    public byte[] generatePdfFromHtml(String templateName, Context context) throws Exception {
        // Log event asynchronously (using null userId since we don't have it explicitly
        // here, or we could pass it in later)
        analyticsService.logEvent(null, "RESUME_GENERATED", "Format: PDF, Template: " + templateName);

        String htmlContent = templateEngine.process(templateName, context);
        return generatePdfFromRawHtml(htmlContent);
    }
}
