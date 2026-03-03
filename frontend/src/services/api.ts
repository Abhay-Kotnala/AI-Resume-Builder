export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/resume`;

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

const getAuthHeaders = (): Record<string, string> => {
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
            if (data && data.message) errorMsg = data.message;
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

export const analyzeResume = async (resumeId: number, jobDescription?: string): Promise<AnalysisResponse> => {
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

    return response.json();
};

export const enhanceBulletPoint = async (bulletPoint: string, targetJob?: string, tone?: string): Promise<{ enhancedBulletPoint: string }> => {
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

    return response.json();
};

export const generateCoverLetter = async (resumeId: number, jobDescription?: string): Promise<{ coverLetter: string }> => {
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

    return response.json();
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

export const tailorResume = async (resumeId: number, jobDescription: string): Promise<ParsedResumeDTO> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/tailor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ jobDescription })
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to tailor resume');
    }
    return response.json();
};

export const importLinkedIn = async (resumeId: number, linkedInText: string): Promise<ParsedResumeDTO> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/import-linkedin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ linkedInText })
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to import LinkedIn profile');
    }
    return response.json();
};

export interface GrammarIssue {
    phrase: string;
    type: 'cliche' | 'passive' | 'vague' | 'typo';
    suggestion: string;
}

export const checkGrammar = async (resumeId: number): Promise<GrammarIssue[]> => {
    const response = await fetch(`${API_BASE_URL}/${resumeId}/grammar-check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        }
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to run grammar check');
    }
    return response.json();
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
