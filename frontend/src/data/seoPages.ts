export interface SeoTip {
    heading: string;
    body: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface SeoPage {
    slug: string;
    title: string; // browser <title>
    h1: string; // page headline
    category: string; // e.g. "Software Engineering", "Healthcare"
    metaDescription: string;
    intro: string; // 2–3 sentence opening paragraph
    tips: SeoTip[];
    faqItems: FaqItem[];
    relatedSlugs: string[]; // slugs of 3 related pages
}

export const SEO_PAGES: SeoPage[] = [
    // ─── Tech ──────────────────────────────────────────────────────────────────
    {
        slug: 'software-engineer-resume-tips',
        title: 'Software Engineer Resume Tips 2026 | Beat ATS — ElevateAI',
        h1: 'Software Engineer Resume Tips That Beat ATS in 2026',
        category: 'Technology',
        metaDescription:
            'Free, expert resume tips for software engineers. Learn how to pass ATS filters, highlight key skills, and land more interviews in 2026.',
        intro:
            'Landing a software engineering role in 2026 is intensely competitive. Before a human reads your resume, an ATS scores it against hundreds of keywords. Here are the five most impactful changes you can make right now.',
        tips: [
            {
                heading: 'Lead with a Strong Technical Summary',
                body: 'The first 3–5 lines of your resume are your ATS headline. Include your primary language (Python, Java, TypeScript), years of experience, and one standout metric (e.g., "shipped features to 2M+ users").',
            },
            {
                heading: 'Mirror Keywords from the Job Description Exactly',
                body: 'If the JD says "distributed systems", use that exact phrase — not "large-scale systems" or "microservices architecture". ATS systems match tokens literally.',
            },
            {
                heading: 'Quantify Every Bullet Point',
                body: 'Replace "Improved API performance" with "Reduced API latency by 42% by introducing Redis caching". Numbers make bullets scannable for both AI and recruiters.',
            },
            {
                heading: 'List Your Tech Stack in a Dedicated Skills Section',
                body: 'Place a clean "Technical Skills" section near the top. Group by category: Languages, Frameworks, Cloud, Databases. This is heavily weighted by most ATS parsers.',
            },
            {
                heading: 'Use a Single-Column ATS-Friendly Layout',
                body: 'Two-column layouts break ATS parsers. Stick to a clean single-column format with standard section headings: Summary, Experience, Projects, Skills, Education.',
            },
        ],
        faqItems: [
            {
                question: 'How long should a software engineer resume be?',
                answer:
                    '1 page for under 5 years of experience, 2 pages for senior engineers. Anything longer is unlikely to be fully read.',
            },
            {
                question: 'Should I include side projects on my resume?',
                answer:
                    'Yes, especially if they use relevant technologies. Include a GitHub link and a brief quantitative impact statement.',
            },
            {
                question: 'What ATS score should I aim for?',
                answer:
                    'Aim for 80+ on ElevateAI\'s free ATS checker. Anything below 60 puts you at serious risk of automatic rejection.',
            },
        ],
        relatedSlugs: ['data-scientist-resume-tips', 'frontend-developer-resume-tips', 'devops-engineer-resume-tips'],
    },
    {
        slug: 'frontend-developer-resume-tips',
        title: 'Frontend Developer Resume Tips 2026 | ATS Optimized — ElevateAI',
        h1: 'Frontend Developer Resume Tips: Get Past ATS in 2026',
        category: 'Technology',
        metaDescription:
            'Expert resume tips for frontend developers. Learn how to present React, TypeScript, and UI/UX skills in a way that beats applicant tracking systems.',
        intro:
            'Frontend development is one of the most competitive fields in tech. Your resume needs to clearly communicate your technical depth AND your impact on product experience. Here\'s how to make it ATS-ready.',
        tips: [
            {
                heading: 'Anchor Your Resume to a Framework',
                body: 'Lead with your primary framework (React, Vue, Angular). Hiring managers and ATS systems search for these first. Don\'t bury them in a long skills list.',
            },
            {
                heading: 'Showcase Core Web Vitals Improvements',
                body: 'Metrics like "Improved Lighthouse score from 62 to 94" or "Reduced LCP by 1.8s" speak directly to what modern frontend roles value: performance.',
            },
            {
                heading: 'Include Accessibility and Testing Skills',
                body: 'WCAG compliance, Jest, Cypress, and Storybook are increasingly required. Mention any experience with a11y audits or component testing.',
            },
            {
                heading: 'Link to a Live Portfolio or GitHub',
                body: 'Frontend roles almost always expect to see your work. Add a portfolio URL to your header and a Projects section with live demo links.',
            },
            {
                heading: 'List Design Collaboration Tools',
                body: 'Figma, Zeplin, and Storybook show you can bridge the design-engineering gap. Even basic Figma familiarity is worth mentioning.',
            },
        ],
        faqItems: [
            {
                question: 'Should I include CSS and HTML on my frontend resume?',
                answer:
                    'Yes, but frame them with skill level or context. "Advanced CSS animations, CSS Grid, and custom design systems" is stronger than just "HTML/CSS".',
            },
            {
                question: 'Is a portfolio required for frontend jobs?',
                answer:
                    'Not always required, but near-universal at well-known companies. Even a simple 3-project GitHub Pages portfolio dramatically increases callbacks.',
            },
            {
                question: 'How do I show UI/UX sensibility on a technical resume?',
                answer:
                    'Mention any Figma collaboration, design system contributions, or A/B test results your UI changes influenced.',
            },
        ],
        relatedSlugs: ['software-engineer-resume-tips', 'fullstack-developer-resume-tips', 'ux-designer-resume-tips'],
    },
    {
        slug: 'data-scientist-resume-tips',
        title: 'Data Scientist Resume Tips 2026 | Beat ATS — ElevateAI',
        h1: 'Data Scientist Resume Tips That Actually Get Interviews in 2026',
        category: 'Technology',
        metaDescription:
            'Learn how to write an ATS-optimized data scientist resume. Expert tips on highlighting Python, ML skills, and quantifiable model impacts.',
        intro:
            'Data science roles attract hundreds of applicants per posting. A generic resume listing "Python, SQL, Machine Learning" won\'t cut it. You need to communicate business impact and technical depth.',
        tips: [
            {
                heading: 'Lead with Your Most Impactful ML Achievement',
                body: 'Headline your summary with your biggest win: "Built a churn prediction model reducing monthly churn by 18%". This immediately differentiates you from candidates who list tools without context.',
            },
            {
                heading: 'List Both Frameworks and Statistical Methods',
                body: 'TensorFlow and PyTorch are tools; regression, hypothesis testing, and Bayesian inference are skills. ATS and hiring managers want to see both.',
            },
            {
                heading: 'Include Kaggle Rank or Public Datasets Work',
                body: 'Kaggle competition placements, published datasets, or Hugging Face contributions signal genuine passion and provide talking points in interviews.',
            },
            {
                heading: 'Quantify Model Performance',
                body: 'Don\'t just say "built a classification model". Say "Achieved 94% F1 score on imbalanced dataset (1:15 ratio) using SMOTE + XGBoost ensemble".',
            },
            {
                heading: 'Show Business Translation Skills',
                body: 'Mentioning that you "presented findings to C-suite" or "translated model outputs into $2M cost savings" shows you can bridge technical and business worlds — a top differentiator.',
            },
        ],
        faqItems: [
            {
                question: 'Should I include a GitHub on a data science resume?',
                answer:
                    'Absolutely. Link to notebooks, not just raw Python files. Clean, well-documented Jupyter notebooks are near-expected for DS roles.',
            },
            {
                question: 'Do I need a PhD for data science jobs?',
                answer:
                    'Not in most companies. Industry roles typically value demonstrated skills and project impact over academic credentials. Your resume should reflect real-world results.',
            },
            {
                question: 'What is the most important keyword for data science ATS?',
                answer:
                    'Python is the single most screened keyword in DS JDs. Beyond that: SQL, machine learning, model deployment, and the specific frameworks (TensorFlow, scikit-learn) vary by role.',
            },
        ],
        relatedSlugs: ['software-engineer-resume-tips', 'machine-learning-engineer-resume-tips', 'business-analyst-resume-tips'],
    },
    {
        slug: 'devops-engineer-resume-tips',
        title: 'DevOps Engineer Resume Tips 2026 | ATS Guide — ElevateAI',
        h1: 'DevOps Engineer Resume Tips: Pass ATS and Land More Interviews',
        category: 'Technology',
        metaDescription:
            'Craft an ATS-optimized DevOps engineer resume. Tips on Kubernetes, CI/CD, cloud platforms, and how to quantify infrastructure impact.',
        intro:
            'DevOps resumes fail ATS when they list tools without showing impact. Recruiters want to see uptime improvements, deployment frequency, and incident reduction — not just a list of AWS services.',
        tips: [
            {
                heading: 'List Certifications Prominently',
                body: 'AWS Solutions Architect, CKA (Certified Kubernetes Administrator), or HashiCorp Terraform certifications are highly valued. Place them near your name in the header.',
            },
            {
                heading: 'Quantify Infrastructure Impact',
                body: '"Reduced deployment time from 45 min to 8 min via GitLab CI/CD pipelines" or "Achieved 99.97% uptime across 200+ microservices" are gold standard bullets.',
            },
            {
                heading: 'Show IaC (Infrastructure as Code) Experience',
                body: 'Terraform, Pulumi, or CloudFormation are must-haves for modern DevOps roles. List the scope: "Managed 40+ services across multi-region AWS via Terraform modules".',
            },
            {
                heading: 'Highlight Observability Tools',
                body: 'Prometheus, Grafana, Datadog, and ELK Stack experience shows you can proactively monitor and diagnose production issues — a top interview signal.',
            },
            {
                heading: 'Mention Security Practices (DevSecOps)',
                body: 'SAST/DAST pipeline integration, secrets management (Vault, AWS Secrets Manager), and SOC 2 compliance contributions are increasingly sought after.',
            },
        ],
        faqItems: [
            {
                question: 'Should I list all cloud providers I have used?',
                answer:
                    'List all but indicate depth. "AWS (primary), Azure (familiar), GCP (basic)" gives recruiters an honest picture.',
            },
            {
                question: 'How do I show on-call experience on a resume?',
                answer:
                    '"On-call rotation lead for 12-person SRE team, maintaining P90 MTTR under 15 minutes" is a strong bullet.',
            },
            {
                question: 'Is Kubernetes required for DevOps roles in 2026?',
                answer:
                    'Yes, for the vast majority of modern DevOps and SRE roles. Docker experience alone is no longer sufficient at most mid-to-large companies.',
            },
        ],
        relatedSlugs: ['software-engineer-resume-tips', 'cloud-architect-resume-tips', 'site-reliability-engineer-resume-tips'],
    },
    {
        slug: 'fullstack-developer-resume-tips',
        title: 'Full Stack Developer Resume Tips 2026 | ATS Optimized — ElevateAI',
        h1: 'Full Stack Developer Resume Tips: What Actually Works in 2026',
        category: 'Technology',
        metaDescription:
            'Write a full stack developer resume that passes ATS and impresses hiring managers. Tips covering React, Node.js, databases, and cloud deployment.',
        intro:
            'Full stack roles demand breadth across frontend, backend, and infrastructure — but your resume only has one page. Here\'s how to strategically present your versatility without appearing shallow.',
        tips: [
            {
                heading: 'Define Your Stack Clearly in the Summary',
                body: 'Use a formula: "Full Stack Engineer specializing in React + Node.js + PostgreSQL on AWS". This immediately tells ATS systems your stack and helps recruiters quickly qualify you.',
            },
            {
                heading: 'Show End-to-End Project Ownership',
                body: 'Bullets like "Architected and shipped full product from Figma designs to production deploy in 6 weeks" communicate true full-stack capability.',
            },
            {
                heading: 'Separate Frontend and Backend Skills Clearly',
                body: 'In your Skills section, group by Frontend (React, TypeScript, CSS) and Backend (Node.js, Express, REST APIs, GraphQL) so ATS parsers categorize you correctly.',
            },
            {
                heading: 'Include Database Experience with Context',
                body: '"Designed PostgreSQL schema for multi-tenant SaaS app (50K+ rows)" is stronger than just listing "PostgreSQL, MongoDB".',
            },
            {
                heading: 'Mention Deployment and CI/CD Familiarity',
                body: 'Even basic Docker + GitHub Actions or Vercel deployment experience shows you can own the full lifecycle — a major differentiator over pure front or backend engineers.',
            },
        ],
        faqItems: [
            {
                question: 'Should a full stack developer resume be 1 or 2 pages?',
                answer:
                    '1 page for under 5 years, 2 pages for senior engineers with extensive project history. Prioritize quality over quantity.',
            },
            {
                question: 'What is the best format for a full stack resume?',
                answer:
                    'A clean reverse-chronological format with a strong Summary, Skills section, and quantified Experience bullets works best for ATS and human readers alike.',
            },
            {
                question: 'Should I specialize or stay general as a full stack developer?',
                answer:
                    'Lean into your strongest area in the summary (e.g., "frontend-leaning full stack engineer") while still listing backend skills. Pure generalism is harder to market.',
            },
        ],
        relatedSlugs: ['frontend-developer-resume-tips', 'software-engineer-resume-tips', 'backend-developer-resume-tips'],
    },

    // ─── Healthcare ────────────────────────────────────────────────────────────
    {
        slug: 'nurse-resume-tips',
        title: 'Nurse Resume Tips 2026 | ATS Optimized Nursing Resume — ElevateAI',
        h1: 'Nurse Resume Tips: Get Past Hospital ATS in 2026',
        category: 'Healthcare',
        metaDescription:
            'Build an ATS-optimized nursing resume. Expert tips on certifications, specializations, and bullet phrasing that gets you more interview callbacks.',
        intro:
            'Hospital systems and healthcare recruiters use ATS just like tech companies do. A nursing resume must include the right clinical keywords and certifications — or it gets auto-rejected before a recruiter sees it.',
        tips: [
            {
                heading: 'List Certifications in Your Header',
                body: 'RN, BSN, CCRN, BLS, ACLS, PALS — place all active certifications directly beneath your name. This is the first thing ATS systems and nurse managers look for.',
            },
            {
                heading: 'Specify Your Unit and Patient Population',
                body: '"3 years of experience in a 22-bed Cardiac ICU managing ventilated patients with LVAD support" is infinitely more searchable than "ICU nurse".',
            },
            {
                heading: 'Quantify Patient Load and Outcomes',
                body: '"Managed 4–6 high-acuity patients per shift with 98% satisfaction score" shows both capability and patient-first mindset.',
            },
            {
                heading: 'Include EHR/EMR Proficiency',
                body: 'Epic, Cerner, Meditech — name the specific systems you use. Healthcare ATS systems heavily screen for these.',
            },
            {
                heading: 'Use Clinical Action Verbs',
                body: 'Lead with "Administered", "Monitored", "Assessed", "Collaborated", and "Educated" rather than generic verbs like "helped" or "worked with".',
            },
        ],
        faqItems: [
            {
                question: 'Do nursing resumes need an objective statement?',
                answer:
                    'Use a Professional Summary instead of an objective. A 3-sentence summary highlighting your specialty, years of experience, and top credential is more impactful.',
            },
            {
                question: 'Should I list every clinical rotation on my nursing resume?',
                answer:
                    'For new grads, yes. For experienced nurses, only list rotations if they add a relevant specialty you haven\'t held as a staff position.',
            },
            {
                question: 'How important are ATS systems for nursing jobs?',
                answer:
                    'Very important at any health system with 50+ beds. Travel nursing agencies also use ATS heavily. Always optimize for both the parser and the human reader.',
            },
        ],
        relatedSlugs: ['healthcare-resume-tips', 'physician-assistant-resume-tips', 'medical-technologist-resume-tips'],
    },

    // ─── Business & Marketing ──────────────────────────────────────────────────
    {
        slug: 'marketing-manager-resume-tips',
        title: 'Marketing Manager Resume Tips 2026 | ATS Guide — ElevateAI',
        h1: 'Marketing Manager Resume Tips That Get Interviews in 2026',
        category: 'Marketing',
        metaDescription:
            'Write an ATS-optimized marketing manager resume. Tips on metrics, channel expertise, and campaign language that gets past automated screening.',
        intro:
            'Marketing manager resumes fail ATS when they focus on soft skills instead of measurable results. Metrics and channel keywords are what distinguish strong candidates. Here\'s what to change today.',
        tips: [
            {
                heading: 'Open With Your Best Campaign Result',
                body: '"Grew organic traffic 280% YoY via content strategy and technical SEO" is the kind of headline summary that gets a recruiter to stop scrolling.',
            },
            {
                heading: 'Name Specific Channels and Platforms',
                body: 'Google Ads, Meta Ads Manager, HubSpot, Marketo, Salesforce, Klaviyo — name every platform you\'ve managed. These are the keywords ATS systems scan for.',
            },
            {
                heading: 'Show ROI and Budget Ownership',
                body: '"Managed $1.2M annual digital marketing budget with 4.8x blended ROAS" demonstrates scale and accountability that separates managers from specialists.',
            },
            {
                heading: 'Include Team Leadership Metrics',
                body: 'If you\'ve managed people, state it: "Led a 6-person growth marketing team across SEO, paid media, and email". Seniority signals matter to ATS ranking.',
            },
            {
                heading: 'Quantify Email and Content Marketing Impact',
                body: '"Increased email open rates from 18% to 31% via segmentation and A/B testing" shows methodical marketing thinking and measurable results.',
            },
        ],
        faqItems: [
            {
                question: 'Should a marketing manager include a portfolio link?',
                answer:
                    'Yes, especially for content, brand, or creative-leaning roles. A Notion portfolio, case study page, or LinkedIn article demonstrates execution ability.',
            },
            {
                question: 'What is the most important metric for a marketing resume?',
                answer:
                    'Revenue impact or return on ad spend (ROAS). Direct revenue attribution is the gold standard — pipeline generated, CPL reduction, or conversion rate lift are strong proxies.',
            },
            {
                question: 'How long should a marketing manager resume be?',
                answer:
                    '1–2 pages. Directors and VPs can use 2 pages; managers with under 8 years should target 1 tight, metrics-dense page.',
            },
        ],
        relatedSlugs: ['product-manager-resume-tips', 'growth-marketer-resume-tips', 'content-strategist-resume-tips'],
    },
    {
        slug: 'product-manager-resume-tips',
        title: 'Product Manager Resume Tips 2026 | ATS Optimized — ElevateAI',
        h1: 'Product Manager Resume Tips: Land PM Roles That Actually Fit You',
        category: 'Business',
        metaDescription:
            'Write a product manager resume that passes ATS and tells a clear product story. Tips on metrics, frameworks, and PM-specific language.',
        intro:
            'Product management is uniquely hard to put on a resume because the work is inherently collaborative. The trick is showing ownership and impact — not just listing features you shipped.',
        tips: [
            {
                heading: 'Lead with a Product + Metric Statement',
                body: '"Product Manager with 5 years growing B2B SaaS products from $0 to $2M ARR" gives ATS the keywords and gives recruiters immediate context.',
            },
            {
                heading: 'Frame Bullets Around Outcomes, Not Features',
                body: 'Avoid "Built a notification system". Prefer "Shipped real-time notification system that reduced churn by 12% among power users".',
            },
            {
                heading: 'Include Frameworks You Use',
                body: 'JTBD, OKRs, story mapping, North Star metric, RICE scoring — these show professional product thinking. Use them naturally in your bullets and summary.',
            },
            {
                heading: 'Highlight Cross-Functional Leadership',
                body: '"Coordinated a 12-person cross-functional team (Eng, Design, Data, Legal) to ship GDPR compliance in 6 weeks" shows influence without authority — the core PM skill.',
            },
            {
                heading: 'Quantify Discovery and Research',
                body: '"Conducted 40+ user interviews and analyzed 200K+ event logs to identify and eliminate top 3 friction points" shows you are data-informed, not opinion-driven.',
            },
        ],
        faqItems: [
            {
                question: 'Should I list technical skills as a product manager?',
                answer:
                    'Yes, especially SQL and data analysis tools (Amplitude, Mixpanel, Looker). Technical PMs are increasingly preferred, especially in engineer-led companies.',
            },
            {
                question: 'How do I show impact without exposing confidential company data?',
                answer:
                    'Use relative metrics ("increased X by Y%") instead of absolute numbers, or note that details are available on request.',
            },
            {
                question: 'Is an MBA required for product management roles?',
                answer:
                    'No. Most tech PMs don\'t have MBAs. Demonstrated product instinct, shipping velocity, and user empathy matter more in most hiring decisions.',
            },
        ],
        relatedSlugs: ['marketing-manager-resume-tips', 'ux-designer-resume-tips', 'business-analyst-resume-tips'],
    },
    {
        slug: 'business-analyst-resume-tips',
        title: 'Business Analyst Resume Tips 2026 | ATS Guide — ElevateAI',
        h1: 'Business Analyst Resume Tips That Beat ATS in 2026',
        category: 'Business',
        metaDescription:
            'Build an ATS-optimized business analyst resume. Expert tips on tools, stakeholder management, and how to quantify analytical impact.',
        intro:
            'Business analyst roles are exploding across industries as organizations become more data-driven. Your resume must show both the analytical tools you use and the business decisions your analysis influenced.',
        tips: [
            {
                heading: 'Open With Your Stack and Domain',
                body: '"Business Analyst with 4 years in e-commerce, proficient in SQL, Tableau, and Jira" tells ATS everything it needs in one sentence.',
            },
            {
                heading: 'Quantify the Scale of Your Analysis',
                body: '"Analyzed 5M+ monthly transaction records to identify $800K in revenue leakage" is infinitely stronger than "performed data analysis".',
            },
            {
                heading: 'Show Process Improvement Results',
                body: '"Redesigned reporting workflow reducing monthly close time from 8 days to 3 days via Power BI automation" is the kind of concrete output BAs should lead with.',
            },
            {
                heading: 'Mention Stakeholder Management Explicitly',
                body: '"Managed requirements across 8 stakeholders in Finance, Operations, and Legal for a $3M ERP migration" demonstrates the core BA superpower.',
            },
            {
                heading: 'List Both Technical and Domain Tools',
                body: 'SQL, Excel, Tableau, Power BI, Lucidchart for tech. Add domain-specific tools: Jira, Confluence, Visio, Salesforce, or industry ERPs.',
            },
        ],
        faqItems: [
            {
                question: 'Should I get a CBAP certification for a BA resume?',
                answer:
                    'It helps, especially at large enterprises or consulting firms. For tech companies, showcasing strong SQL and data visualization skills often matters more.',
            },
            {
                question: 'What is the difference between a BA and a data analyst resume?',
                answer:
                    'BAs emphasize requirements gathering, process improvement, and stakeholder communication. Data analysts emphasize statistical analysis, modeling, and visualization depth.',
            },
            {
                question: 'Is SQL required for business analysts?',
                answer:
                    'Yes, at nearly every modern company. Even basic SELECT + JOIN proficiency is an expected baseline — intermediate SQL is a strong differentiator.',
            },
        ],
        relatedSlugs: ['data-scientist-resume-tips', 'product-manager-resume-tips', 'financial-analyst-resume-tips'],
    },

    // ─── Education ─────────────────────────────────────────────────────────────
    {
        slug: 'teacher-resume-tips',
        title: 'Teacher Resume Tips 2026 | ATS-Optimized Teaching Resume — ElevateAI',
        h1: 'Teacher Resume Tips: Get Your Application Past ATS in 2026',
        category: 'Education',
        metaDescription:
            'Build a teaching resume that beats school district ATS systems. Tips on certifications, classroom management phrasing, and student outcome metrics.',
        intro:
            'School districts increasingly use ATS to screen hundreds of teacher applicants. Knowing how to optimize for those systems — while still sounding human — is a real competitive edge.',
        tips: [
            {
                heading: 'Lead With Your Certification and Grade Level',
                body: '"State-certified K-5 teacher with 6 years of experience in Title I schools" immediately anchors your resume for district ATS and hiring principals.',
            },
            {
                heading: 'Quantify Student Outcomes',
                body: '"Increased 4th-grade reading scores by an average of 1.8 grade levels within one academic year" is the metric equivalent of a business analyst\'s revenue impact.',
            },
            {
                heading: 'List Curriculum Frameworks and Tools',
                body: 'Common Core, IEP, STEM, Google Classroom, Seesaw, Schoology, Canva for Education — these are keyword-rich and heavily filtered by district ATS.',
            },
            {
                heading: 'Show Classroom Management as a Skill',
                body: '"Implemented restorative justice practices reducing classroom referrals by 60%" is a powerful, specific bullet that goes beyond "managed classroom behavior".',
            },
            {
                heading: 'Include Professional Development',
                body: 'IB certification, Reading Recovery training, ISTE coaching certification, or trauma-informed care workshops signal initiative and growth.',
            },
        ],
        faqItems: [
            {
                question: 'Do teacher resumes go through ATS?',
                answer:
                    'Yes, at most public school districts with 20+ schools and at private school networks. Smaller independent schools may review resumes manually.',
            },
            {
                question: 'Should teachers include a teaching philosophy on their resume?',
                answer:
                    'No — keep that for your cover letter or portfolio. Use the resume space for concrete certifications and student outcome metrics.',
            },
            {
                question: 'How should a new teacher write a resume without experience?',
                answer:
                    'Focus on student teaching/practicum metrics, academic projects, tutoring experience, and any certifications earned. Volunteer or after-school program leadership is valuable.',
            },
        ],
        relatedSlugs: ['school-counselor-resume-tips', 'instructional-designer-resume-tips', 'higher-education-resume-tips'],
    },

    // ─── Finance ───────────────────────────────────────────────────────────────
    {
        slug: 'financial-analyst-resume-tips',
        title: 'Financial Analyst Resume Tips 2026 | ATS Optimized — ElevateAI',
        h1: 'Financial Analyst Resume Tips: Land More Interviews in 2026',
        category: 'Finance',
        metaDescription:
            'Write an ATS-ready financial analyst resume. Expert tips on Excel, financial modeling, and presenting analysis results that impress hiring managers.',
        intro:
            'Financial analyst resumes need to communicate both technical rigor and business impact. ATS systems in finance screen for specific tools and credentials — here\'s how to make sure you\'re seen.',
        tips: [
            {
                heading: 'Put CFA, CPA, or FRM Credentials in Your Header',
                body: 'Finance certifications are near-universal screeners. Place them directly after your name: "Jane Doe, CFA Level II Candidate".',
            },
            {
                heading: 'Quantify the Scale of Portfolios or Budgets You\'ve Analyzed',
                body: '"Built DCF models for 12 acquisition targets totaling $850M in enterprise value" shows scope that generic bullets never convey.',
            },
            {
                heading: 'List Advanced Excel and BI Tools Explicitly',
                body: 'Excel (pivot tables, VBA, Power Query), Bloomberg Terminal, Tableau, SQL, and Power BI are standard screened keywords in finance ATS systems.',
            },
            {
                heading: 'Show Forecasting Accuracy',
                body: '"Developed revenue forecast model with 94% accuracy over 12-quarter period" is precisely the kind of concrete outcome that earns a second look.',
            },
            {
                heading: 'Include Industry Specialization',
                body: 'Healthcare finance, real estate, private equity, FP&A — name your niche. Industry-specific ATS often filter for these before anything else.',
            },
        ],
        faqItems: [
            {
                question: 'Do financial analysts need SQL on their resume?',
                answer:
                    'Increasingly yes, especially in FP&A and corporate finance roles at tech or data-driven companies. Even basic SQL proficiency is a strong differentiator.',
            },
            {
                question: 'Should I include GPA on a finance resume?',
                answer:
                    'Yes if it\'s 3.5 or higher and you graduated within the last 5 years. Drop it after that.',
            },
            {
                question: 'What is the best length for a financial analyst resume?',
                answer:
                    '1 page for analysts with fewer than 7 years of experience. Senior analysts and above can use 2 pages with detailed deal or model histories.',
            },
        ],
        relatedSlugs: ['business-analyst-resume-tips', 'investment-banking-resume-tips', 'accounting-resume-tips'],
    },
];

// Helper: look up a page by slug
export const getSeoPageBySlug = (slug: string): SeoPage | undefined => {
    return SEO_PAGES.find((p) => p.slug === slug);
};

// Helper: get related pages for a given slug
export const getRelatedPages = (slug: string): SeoPage[] => {
    const page = getSeoPageBySlug(slug);
    if (!page) return [];
    return page.relatedSlugs
        .map((s) => getSeoPageBySlug(s))
        .filter((p): p is SeoPage => p !== undefined);
};
