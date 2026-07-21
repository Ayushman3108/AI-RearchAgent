// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const rawReportInput = document.getElementById('raw-report');
const reviewBtn = document.getElementById('review-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const btnText = document.querySelector('.btn-text');
const resultsPanel = document.getElementById('results-panel');
const reviewedReportOutput = document.getElementById('reviewed-report');
const statusMessage = document.getElementById('status-message');

// Configuration
const API_BASE_URL = (() => {
    const currentPort = window.location.port;
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        if (currentPort === '8000') {
            return window.location.origin;
        }
    }
    return 'http://127.0.0.1:8000';
})();
let currentReviewData = null;

// Theme Initialization
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerText = '☀️';
    }
};

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerText = '🌙 ';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerText = '☀️';
    }
});

// UI State Management
const setProcessingState = (isProcessing) => {
    reviewBtn.disabled = isProcessing;
    rawReportInput.disabled = isProcessing;
    clearBtn.disabled = isProcessing;
    
    if (isProcessing) {
        btnText.innerText = 'Processing...';
        loadingSpinner.classList.remove('hidden');
        hideStatus();
    } else {
        btnText.innerText = 'Review Report';
        loadingSpinner.classList.add('hidden');
    }
};

const showStatus = (message, isError = false) => {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isError ? 'error-msg' : 'success-msg'}`;
    statusMessage.classList.remove('hidden');
};

const hideStatus = () => {
    statusMessage.classList.add('hidden');
};

const populateResults = (data) => {
    currentReviewData = data;

    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('review-content').classList.remove('hidden');

    document.getElementById('stat-grammar').innerText = data.grammar_score || 0;
    document.getElementById('stat-readability').innerText = data.readability_score || 0;
    document.getElementById('stat-formatting').innerText = data.formatting_score || 0;
    document.getElementById('stat-words').innerText = data.word_count || 0;
    document.getElementById('stat-chars').innerText = data.character_count || 0;

    reviewedReportOutput.value = data.reviewed_report || "";

    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = "";

    (data.suggestions || []).forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });
};

// Event Listeners
clearBtn.addEventListener('click', () => {
    rawReportInput.value = '';

    document.getElementById('review-content').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');

    hideStatus();
    currentReviewData = null;
});

document.getElementById('copy-btn').addEventListener('click', () => {
    if (reviewedReportOutput.value) {
        navigator.clipboard.writeText(reviewedReportOutput.value)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => console.error('Failed to copy text: ', err));
    }
});

const downloadBlob = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const escapePdfText = (text) => text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const buildSimplePdf = (text) => {
    const lines = text.split(/\r?\n/).slice(0, 50);
    const streamLines = lines.map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 14} Td (${escapePdfText(line)}) Tj ET`);
    const stream = streamLines.join('\n');

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    const addObject = (content) => {
        offsets.push(pdf.length);
        pdf += `${offsets.length} 0 obj\n${content}\nendobj\n`;
    };

    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${offsets.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return pdf;
};

const handleExport = (format) => {
    if (!currentReviewData) {
        showStatus('Review a report first before exporting.', true);
        return;
    }

    const safeTitle = (currentReviewData.reviewed_report || 'review').replace(/\s+/g, '_').slice(0, 40) || 'review';

    if (format === 'txt') {
        const text = `${currentReviewData.reviewed_report}\n\nSuggestions:\n${(currentReviewData.suggestions || []).join('\n')}`;
        downloadBlob(text, `${safeTitle}.txt`, 'text/plain;charset=utf-8');
        showStatus('TXT export started.');
    } else if (format === 'json') {
        downloadBlob(JSON.stringify(currentReviewData, null, 2), `${safeTitle}.json`, 'application/json;charset=utf-8');
        showStatus('JSON export started.');
    } else if (format === 'pdf') {
        const text = `${currentReviewData.reviewed_report}\n\nSuggestions:\n${(currentReviewData.suggestions || []).join('\n')}`;
        downloadBlob(buildSimplePdf(text), `${safeTitle}.pdf`, 'application/pdf');
        showStatus('PDF export started.');
    }
};

document.getElementById('export-pdf-btn').addEventListener('click', () => handleExport('pdf'));
document.getElementById('export-txt-btn').addEventListener('click', () => handleExport('txt'));
document.getElementById('export-json-btn').addEventListener('click', () => handleExport('json'));

reviewBtn.addEventListener('click', async () => {
    const text = rawReportInput.value.trim();
    if (!text) {
        showStatus('Please enter a report to review.', true);
        return;
    }

    setProcessingState(true);

    try {
        const response = await fetch(`${API_BASE_URL}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report: text })
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            throw new Error(payload?.detail || 'Review request failed.');
        }

        populateResults(payload);
        localStorage.setItem("reviewData", JSON.stringify(payload));
        showStatus('Report reviewed successfully.');
    } catch (error) {
        const message = error?.message || 'Could not review report.';
        showStatus(message, true);
    } finally {
        setProcessingState(false);
    }
});

// Init
initTheme();

// Auto-load report from Writer page
const savedReport = localStorage.getItem("reportData");

if (savedReport) {
    const report = JSON.parse(savedReport);

    rawReportInput.value = report.markdown || report.reviewed_report || "";
}

// Automatically start review
if (rawReportInput.value.trim()) {
    reviewBtn.click();
}