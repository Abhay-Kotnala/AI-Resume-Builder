package com.airesume.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class PdfParserServiceTest {

    private final PdfParserService pdfParserService = new PdfParserService();

    @Test
    void extractTextFromPdf_EmptyFile_ThrowsException() {
        MultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            pdfParserService.extractTextFromPdf(emptyFile);
        });

        assertEquals("Cannot parse an empty file.", exception.getMessage());
    }

    @Test
    void extractTextFromPdf_InvalidFileFormat_ThrowsException() {
        MultipartFile invalidFile = new MockMultipartFile("file", "test.txt", "text/plain",
                "Not a PDF content".getBytes());

        assertThrows(IOException.class, () -> {
            pdfParserService.extractTextFromPdf(invalidFile);
        });
    }
}
