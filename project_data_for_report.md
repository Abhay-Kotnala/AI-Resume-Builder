# ElevateAI (AI Resume Builder) - Project Data Report

This document contains a structured breakdown of the technology stack and core functions/features of the ElevateAI (AI Resume Builder) project. This data is optimized for use with an AI research tool like Perplexity to generate a comprehensive project report.

## 1. Technology Stack

### Frontend Architecture
* **Framework:** React 18 with TypeScript.
* **Build Tool:** Vite (for fast, optimized bundling).
* **Styling:** Tailwind CSS V4 (utility-first styling).
* **Routing:** React Router v7.
* **UI Components & Icons:** Lucide React for consistent iconography.
* **Data Visualization:** Recharts (for rendering ATS score rings and analytics charts).
* **Interactivity:** `@dnd-kit` (Core, Sortable, Utilities) for drag-and-drop functionality within the resume canvas.
* **Payments:** `@stripe/stripe-js` for handling premium subscription logic on the client side.
* **Analytics/Tracking:** `react-ga4` for Google Analytics integration.
* **Deployment:** Vercel.

### Backend Architecture
* **Framework:** Java 17 with Spring Boot 3.2.3.
* **Database & ORM:** PostgreSQL managed via Spring Data JPA.
* **Security & Auth:** Spring Security with OAuth2 Client and custom JWT (JSON Web Tokens) implementation using `io.jsonwebtoken`.
* **AI Integration:** Google Gemini AI (via HTTP/REST for NLP tasks) managed through a custom `AiAnalysisService`.
* **PDF Processing & Parsing:** Apache PDFBox (for extracting raw text from uploaded PDFs).
* **Document Generation:**
  * **PDFs:** Thymeleaf (HTML templating engine) combined with Microsoft Playwright (rendering HTML to high-quality PDF files).
  * **Word/DOCX:** Apache POI (programmatic creation of `.docx` Microsoft Word files).
* **Payments/Billing:** Stripe Java SDK (`stripe-java`) for processing backend webhook events and subscription states.

---

## 2. Core Functions & Features

### 2.1 Resume Upload & Intelligent Parsing
* **Functionality:** Users upload a PDF resume. The backend extracts text using PDFBox.
* **AI Structure Parsing:** The raw text is sent to the AI service, which intelligently parses the unstructured text into structured JSON fields (Contact Info, Experience, Education, Skills, Summary).
* **End Goal:** Eliminates manual data entry by pre-filling the Resume Canvas natively.

### 2.2 AI Resume Analysis & Scoring (ATS Engine)
* **Functionality:** Compares the updated resume against an optional Target Job Description.
* **Output:** Generates comprehensive metrics including:
  * **ATS Score:** Overall compatibility score.
  * **Impact & Formatting Scores:** Evaluation of action verbs and layout quality.
  * **Strengths & Weaknesses:** Contextual feedback on how the resume reads to recruiters.
  * **Keyword Optimization:** A breakdown of *Found Keywords* vs *Missing Keywords* required by the job description.

### 2.3 AI Bullet Point Enhancer
* **Functionality:** Allows users to select a single bullet point in their experience section and dynamically rewrite it.
* **Mechanics:** Considers the *Target Job* and desired *Tone* (e.g., Professional, Confident, Technical) to generate an optimized, metrics-driven bullet point.

### 2.4 Automatic Resume Tailoring
* **Functionality:** An advanced feature that rewrites the *entire* resume summary and experience summaries to align flawlessly with a provided job description.
* **End Goal:** Customizes the resume for a specific application in a single click.

### 2.5 Job Match Analyzer
* **Functionality:** Performs a deep semantic comparison between the current resume state and a specific job posting.
* **Output:** Determines the percentage match and identifies critical skill gaps.

### 2.6 AI Cover Letter Generation (Pro Feature)
* **Functionality:** Takes the parsed resume and the target job description to automatically draft a highly personalized, ready-to-use cover letter.

### 2.7 AI Interview Preparation (Pro Feature)
* **Functionality:** Analyzes the resume's history alongside the target role to predict likely interview questions.
* **Output:** Generates a custom list of behavioral and technical questions to help the user practice contextually.

### 2.8 Interactive Resume Canvas
* **Functionality:** A frontend drag-and-drop WYSIWYG editor. Users can dynamically reorder sections, edit text inline, and apply structural changes.
* **Backend Sync:** Uses PATCH requests (`/{resumeId}/parsed`) to save granular edits back to the PostgreSQL database in real-time.

### 2.9 Multi-Format Export Engine
* **Dynamic PDF Export:** Uses Thymeleaf to map resume data to different visual templates (e.g., Modern, Executive, Minimalist) and Playwright to render a pixel-perfect PDF.
* **DOCX Export:** Uses Apache POI to generate a fully editable Microsoft Word version of the tailored resume.
* **Paywall Enforcement:** Basic templates are free; Premium templates are dynamically paywalled via Stripe based on the user's scan quota and subscription level.

### 2.10 History, Versioning & Cloning
* **Functionality:** Users can view a dashboard of all past uploaded and generated resumes (`/history`).
* **Version Control:** Users can add custom *labels* to specific resume versions or *clone* an existing resume to tailor it for a new job without destroying the original data.

### 2.11 Dynamic Quota System
* **Functionality:** Enforces a free-tier limit. Core functions track usage, and premium AI features (like Cover Letters or Custom Templates) automatically trigger the Stripe paywall flow upon reaching limits.
