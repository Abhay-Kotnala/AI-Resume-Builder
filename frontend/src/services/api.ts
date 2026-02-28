export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/resume`;

export interface AnalysisResponse {
    id: number;
    resumeId: number;
    atsScore: number;
    impactScore: number;
    brevityScore: number;
    actionVerbScore: number;
    summary: string;
    strengths: string;
    weaknesses: string;
    suggestedImprovements: string;
    foundKeywords?: string;
    missingKeywords?: string;
    isPartialAnalysis?: boolean;
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

export const enhanceBulletPoint = async (bulletPoint: string, targetJob?: string): Promise<{ enhancedBulletPoint: string }> => {
    const response = await fetch(`${API_BASE_URL}/enhance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ bulletPoint, targetJob }),
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
    template: string;
    font: string;
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
