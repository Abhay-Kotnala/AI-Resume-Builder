# ElevateAI: Intelligent Resume Optimization Platform

ElevateAI is a modern, AI-powered web application designed to help job seekers bypass Applicant Tracking Systems (ATS) and secure more interviews. By leveraging advanced generative AI, ElevateAI transforms weak, descriptive resumes into highly impactful, metric-driven professional profiles.

## 🚀 Key Features

*   **Intelligent ATS Scanning:** Upload a resume (PDF/Text) and compare it against a specific job description. The AI acts as a strict Technical Recruiter to provide an ATS parseability score and identify critical missing keywords.
*   **"Click-to-Fix" Interactive Editor:** A highly dynamic frontend component that demonstrates the power of the AI engine. Users can see weak bullet points transformed into strong, XYZ-formula achievements in real-time.
*   **Strategic Bullet Point Rewriter:** The backend AI is tuned to act as an elite career coach, strictly enforcing quantifiable, impact-driven sentences ("Accomplished X, as measured by Y, by doing Z").
*   **Contextual Cover Letter Generator:** Generates modern, compelling cover letters tailored to both the candidate's specific background and the target job description, avoiding generic clichés.
*   **Premium Checkout Flow:** Includes a fully functional frontend routing system with a simulated, high-converting Stripe-style checkout process for upgrading to "Pro" tiers.

---

## 🛠️ Technology Stack

ElevateAI is built on a robust, decoupled architecture separating the presentation layer from the AI processing engine.

### Frontend (User Interface)
*   **Framework:** React 18+ with TypeScript for type safety.
*   **Build Tool:** Vite for lightning-fast Hot Module Replacement (HMR) and optimized production builds.
*   **Styling:** Tailwind CSS (v4) for utility-first, highly responsive, and beautiful modern design.
*   **Routing:** `react-router-dom` for seamless Client-Side Routing (CSR) between the Landing, Article, Pricing, Checkout, and Success pages.
*   **Animations:** CSS transitions and `canvas-confetti` for celebratory post-purchase feedback.

### Backend (AI Engine & API)
*   **Framework:** Java Spring Boot (Spring Web).
*   **AI Provider:** Google Gemini API (integrated via Spring's `RestClient` and `ObjectMapper`).
*   **Security & Architecture:** Configured with CORS for Cross-Origin resource sharing with the frontend and structured with robust Controller/Service layers. 
*   **Prompt Engineering:** Complex, persona-driven prompts designed to enforce strict JSON output formatting and high-quality career advice.

---

## ⚙️ Architecture & Data Flow

1.  **User Interaction:** A user uploads their resume PDF and a target job description via the React frontend.
2.  **API Proxy:** The Vite development server (`vite.config.ts`) proxies the `/api/resume/` request to avoid CORS issues entirely during development, routing it to the local Spring Boot instance running on port `8080`.
3.  **Controller Layer:** The Spring Boot `ResumeController` receives the multipart file and text parameters.
4.  **Service Layer (AI Analysis):** 
    *   The `AiAnalysisService` extracts the text (simulated for PDFs in this iteration).
    *   It injects the text into highly specific, engineered prompts (e.g., "Act as a strict ATS algorithm...").
    *   It formats the payload and makes a synchronous REST call to the Gemini API endpoint.
5.  **Response Handling:** The service parses the Gemini JSON response, maps it to structured Java Data Transfer Objects (DTOs: `AnalysisResponse`), and returns it to the controller.
6.  **UI Updates:** The React frontend receives the JSON payload and dynamically updates the dashboard, rendering the ATS score, strengths, weaknesses, and improved bullet points.

---

## 💰 Monetization Strategy

The application is structured around a **Freemium SaaS** model:
*   **Basic Tier (Free):** Users receive limited resume scans and basic formatting checks to experience the "Aha!" moment.
*   **Pro Prep Tier ($19/mo):** Users hit a paywall (demonstrated via the `/checkout` route) to unlock unlimited bullet point rewrites, full keyword gap analysis, and automated cover letter generation. 

## 🏃‍♂️ Running Locally

**Prerequisites:** 
*   Node.js (v18+)
*   Java Development Kit (JDK 17+)
*   Maven

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
# Ensure GEMINI_API_KEY is set in src/main/resources/application.properties
./mvnw spring-boot:run
# Runs on http://localhost:8080
```
