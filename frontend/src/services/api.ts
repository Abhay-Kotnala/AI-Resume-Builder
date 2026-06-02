export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/resume`;

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface JobResponse<T = any> {
    jobId: string;
    status: JobStatus;
    result?: T;
    error?: string;
}

export const pollJob = async <T>(jobId: string, onProgress?: (status: string) => void): Promise<T> => {
    while (true) {
        // We use the base URL for jobs because the backend maps it to /api/jobs, not /api/resume/jobs
        const JOBS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/jobs`;
        const response = await fetch(`${JOBS_API_URL}/${jobId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to poll job ${jobId}`);
        }

        const data: JobResponse<T> = await response.json();
        if (data.status === 'COMPLETED') {
            return data.result as T;
        } else if (data.status === 'FAILED') {
            throw new Error(data.error || 'Job failed');
        }

        if (onProgress) {
            onProgress(data.status);
        }

        // Wait 2 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};


export interface ExperienceDTO {
    company: string;
    role: string;
    dates: string;
    summary: string;
}

export interface EducationDTO {
    institution: string;
    degree: string;
    graduationDate: string;
    details?: string;
}

export interface ParsedResumeDTO {
    id?: number;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experiences?: ExperienceDTO[];
    educations?: EducationDTO[];
    customSections?: Record<string, string>;
}

export interface AnalysisResponse {
    id: number;
    resumeId: number;
    atsScore: number;
    impactScore: number;
    formattingScore: number;
    keywordsScore: number;
    summary: string;
    strengths: string;
    weaknesses: string;
    suggestedImprovements: string;
    foundKeywords?: string;
    missingKeywords?: string;
    isPartialAnalysis?: boolean;
    parsedResume?: ParsedResumeDTO;
}

export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('elevateAI_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleApiError = async (response: Response, defaultMessage: string) => {
    if (response.status === 401) {
        localStorage.removeItem('elevateAI_token');
        throw new Error('Your session has expired. Please refresh the page and sign in again.');
    }
    let errorMsg = defaultMessage;
    let errorCode = 'Unknown';
    try {
        const text = await response.text();
        if (text) {
            const data = JSON.parse(text);
            if (data && data.message) {
                errorMsg = data.message;
            } else if (data && data.error) {
                errorMsg = data.error;
            }
            if (data && data.error) errorCode = data.error;
        }
    } catch (e) { }

    const error = new Error(errorMsg) as any;
    error.code = errorCode;
    throw error;
};

export const uploadResume = async (file: File): Promise<{ resumeId: number, message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
        },
        body: formData,
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to upload resume');
    }

    return response.json();
};

export const analyzeResume = async (resumeId: number, jobDescription?: string, onProgress?: (status: string) => void): Promise<AnalysisResponse> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to analyze resume');
    }

    const { jobId } = await response.json();
    return pollJob<AnalysisResponse>(jobId, onProgress);
};

export const fetchResumeResult = async (resumeId: number): Promise<AnalysisResponse> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/result`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to fetch resume result');
    }

    return response.json();
};

export const enhanceBulletPoint = async (bulletPoint: string, targetJob?: string, tone?: string, onProgress?: (status: string) => void): Promise<{ enhancedBulletPoint: string }> => {
    const response = await fetch(`${API_BASE_URL}/enhance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ bulletPoint, targetJob, tone }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to enhance bullet point');
    }

    const { jobId } = await response.json();
    return pollJob<{ enhancedBulletPoint: string }>(jobId, onProgress);
};

export const generateCoverLetter = async (resumeId: number, jobDescription: string, onProgress?: (status: string) => void): Promise<{ coverLetter: string }> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/cover-letter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to generate cover letter');
    }

    const { jobId } = await response.json();
    return pollJob<{ coverLetter: string }>(jobId, onProgress);
};

export const generateInterviewQuestions = async (resumeId: number, jobDescription: string, onProgress?: (status: string) => void): Promise<{ questions: string }> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/interview-questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to generate interview questions');
    }

    const { jobId } = await response.json();
    return pollJob<{ questions: string }>(jobId, onProgress);
};

export const generateLinkedInProfile = async (resumeId: number, onProgress?: (status: string) => void): Promise<{ profile: string }> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/linkedin-profile`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to generate LinkedIn profile');
    }

    const { jobId } = await response.json();
    return pollJob<{ profile: string }>(jobId, onProgress);
};

export const analyzeJobMatch = async (resumeId: number, jobDescription: string, onProgress?: (status: string) => void): Promise<{ matchResult: string }> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/match`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to analyze job match');
    }

    const { jobId } = await response.json();
    return pollJob<{ matchResult: string }>(jobId, onProgress);
};

export interface PdfExportOptions {
    text: string;
    template?: string;
    font?: string;
    appliedEdits?: Array<{ original: string; enhanced: string }>;
    sectionOrder?: string[];
}

export const exportToPdf = async (resumeId: number, options: PdfExportOptions): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/export-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(options)
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to export PDF');
    }

    // Convert the response into a blob, and create a temporary link to download it
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Attempt to extract the filename from the content-disposition header if present
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'ElevateAI_Resume.pdf';
    if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const exportToDocx = async (resumeId: number, options: PdfExportOptions): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/export-docx`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(options)
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to export DOCX');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'ElevateAI_Resume.docx';
    if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const patchParsedResume = async (
    resumeId: number,
    field: string,
    value: string,
    expIndex?: number,
    eduIndex?: number
): Promise<void> => {
    const body: Record<string, unknown> = { field, value };
    if (expIndex !== undefined) body.expIndex = expIndex;
    if (eduIndex !== undefined) body.eduIndex = eduIndex;

    const response = await fetch(`${API_BASE_URL}/${resumeId}/parsed`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to save edit');
    }
};



export interface ResumeResponseDto {
    id: number;
    fileName: string;
    label?: string;
    atsScore: number;
    uploadDate: string;
}

export const fetchMyResumes = async (): Promise<ResumeResponseDto[]> => {
    const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to fetch your resumes');
    }

    return response.json();
};

export const patchResumeLabel = async (resumeId: number, label: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/label`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ label }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to update resume label');
    }
};

export const deleteResume = async (resumeId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to delete resume');
    }
};

export const cloneResume = async (resumeId: number): Promise<{ message: string, newResumeId: number }> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/clone`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to duplicate resume');
    }

    return response.json();
};

// --- Job Tracker APIs ---

export interface JobApplicationDTO {
    id?: number;
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    status: string; // WISHLIST, APPLIED, INTERVIEWING, OFFER, REJECTED
    salaryRange?: string;
    notes?: string;
    appliedDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const fetchApplications = async (): Promise<JobApplicationDTO[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to fetch job applications');
    }

    return response.json();
};

export const createApplication = async (application: JobApplicationDTO): Promise<JobApplicationDTO> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(application),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to create job application');
    }

    return response.json();
};

export const updateApplication = async (id: number, application: JobApplicationDTO): Promise<JobApplicationDTO> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(application),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to update job application');
    }

    return response.json();
};

export const deleteApplication = async (id: number): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to delete job application');
    }
};

