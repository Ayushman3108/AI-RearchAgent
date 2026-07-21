/**
 * UI Controller and Application Engine Core Orchestration Script
 */

document.addEventListener('DOMContentLoaded',async () => {
    // API Route Endpoint Mapping Parameters
    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Global Operational State Object Layer Cache Contexts
    let currentAnalysisData = null;

    // DOM Elements Mapping Matrix Definition Handles
    const elements = {
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        researchInput: document.getElementById('researchInput'),
        wordCountLabel: document.getElementById('wordCountLabel'),
        charCountLabel: document.getElementById('charCountLabel'),
        analyzeSubmitBtn: document.getElementById('analyzeSubmitBtn'),
        btnSpinner: document.getElementById('btnSpinner'),
        progressContainer: document.getElementById('progressContainer'),
        progressBarFill: document.getElementById('progressBarFill'),
        progressStatusText: document.getElementById('progressStatusText'),
        outputGlobalActions: document.getElementById('outputGlobalActions'),
        emptyStatePlaceholder: document.getElementById('emptyStatePlaceholder'),
        analysisOutputGrid: document.getElementById('analysisOutputGrid'),
        toastNotification: document.getElementById('toastNotification'),
        
        // Output Data Display Card Value Selectors
        summaryField: document.getElementById('summaryField'),
        keyPointsField: document.getElementById('keyPointsField'),
        statisticsField: document.getElementById('statisticsField'),
        advantagesField: document.getElementById('advantagesField'),
        challengesField: document.getElementById('challengesField'),
        trendsField: document.getElementById('trendsField'),
        keywordsField: document.getElementById('keywordsField'),
        
        // General Utility Buttons Action Binding Selectors
        pasteInputBtn: document.getElementById('pasteInputBtn'),
        copyInputBtn: document.getElementById('copyInputBtn'),
        clearInputBtn: document.getElementById('clearInputBtn'),
        clearOutputBtn: document.getElementById('clearOutputBtn'),
        copyJsonBtn: document.getElementById('copyJsonBtn'),
        exportJsonBtn: document.getElementById('exportJsonBtn'),
        exportTxtBtn: document.getElementById('exportTxtBtn')
    };

    /* ==========================================
     * THEME ENGINE ARCHITECTURAL PERSISTENCE MANAGEMENT
     * ========================================== */
    const initThemeEngine = () => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', storedTheme);
        
        elements.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
            showNotification(`Interface changed to ${targetTheme} environment schema.`, 'success');
        });
    };

    /* ==========================================
     * NOTIFICATION & TOAST UX HELPER METHODS
     * ========================================== */
    const showNotification = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <span style="margin-left: 1rem; cursor: pointer; opacity: 0.7;" class="toast-close-btn">&times;</span>
        `;
        
        elements.toastNotification.appendChild(toast);
        
        toast.querySelector('.toast-close-btn').addEventListener('click', () => toast.remove());
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    };

    /* ==========================================
     * METRIC ENGINE TRACKING CALCULATORS
     * ========================================== */
    const updateInputMetrics = () => {
        const val = elements.researchInput.value || '';
        const charCount = val.length;
        // Basic space split pattern for raw word approximation metrics
        const wordCount = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
        
        elements.charCountLabel.textContent = `Characters: ${charCount}`;
        elements.wordCountLabel.textContent = `Words: ${wordCount}`;
    };

    elements.researchInput.addEventListener('input', updateInputMetrics);

    /* ==========================================
     * CLIPBOARD & SYSTEM INTERFACE UTILITIES
     * ========================================== */
    elements.pasteInputBtn.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText) {
                elements.researchInput.value = clipboardText;
                updateInputMetrics();
                showNotification('Ingest clipboard context read successfully.', 'success');
            }
        } catch (err) {
            showNotification('Unable to read system clip bounds automatically.', 'error');
        }
    });

    elements.copyInputBtn.addEventListener('click', () => {
        const inputVal = elements.researchInput.value;
        if (!inputVal) return showNotification('Ingest buffer is empty.', 'error');
        
        navigator.clipboard.writeText(inputVal)
            .then(() => showNotification('Input copied to clipboard storage.', 'success'))
            .catch(() => showNotification('Execution of copy instruction failed.', 'error'));
    });

    elements.clearInputBtn.addEventListener('click', () => {
        elements.researchInput.value = '';
        updateInputMetrics();
        showNotification('Ingestion context fields purged.', 'success');
    });

    elements.clearOutputBtn.addEventListener('click', () => {
        currentAnalysisData = null;
        elements.analysisOutputGrid.classList.add('hidden');
        elements.emptyStatePlaceholder.classList.remove('hidden');
        elements.outputGlobalActions.style.opacity = '0.4';
        elements.outputGlobalActions.style.pointerEvents = 'none';
        showNotification('Analytics view buffers cleared.', 'success');
    });

    /* ==========================================
     * OUTPUT RENDER GRAPHICS PROCESSING LAYERS
     * ========================================== */
    const renderAnalysisData = (data) => {
        // High level primitive string properties mapping
        elements.summaryField.textContent = data.summary;

        // Structured Array elements interpolation processes loop mapping helper
        const populateList = (domContainer, dataList) => {
            domContainer.innerHTML = '';
            if (!dataList || dataList.length === 0) {
                domContainer.innerHTML = '<li>No significant parameter contexts discovered by model.</li>';
                return;
            }
            dataList.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                domContainer.appendChild(li);
            });
        };

        populateList(elements.keyPointsField, data.key_points);
        populateList(elements.statisticsField, data.statistics);
        populateList(elements.advantagesField, data.advantages);
        populateList(elements.challengesField, data.challenges);
        populateList(elements.trendsField, data.future_trends);

        // Keywords collection tag cloud rendering
        elements.keywordsField.innerHTML = '';
        if (data.keywords && data.keywords.length > 0) {
            data.keywords.forEach(kw => {
                const pill = document.createElement('span');
                pill.className = 'keyword-pill';
                pill.textContent = kw;
                elements.keywordsField.appendChild(pill);
            });
        } else {
            elements.keywordsField.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">No tags.</span>';
        }

        // Toggle visibility matrix transitions
        elements.emptyStatePlaceholder.classList.add('hidden');
        elements.analysisOutputGrid.classList.remove('hidden');
        elements.outputGlobalActions.style.opacity = '1';
        elements.outputGlobalActions.style.pointerEvents = 'auto';
    };

    /* ==========================================
     * CORE ENDPOINT TRANSACTION HANDLERS
     * ========================================== */
    const executeAnalysisPipeline = async () => {
        const rawText = elements.researchInput.value;
        if (!rawText || rawText.trim().length < 20) {
            showNotification('Input content length fails minimum thresholds (20 char minimum).', 'error');
            return;
        }

        // Set UI up for pending asynchronous execution processing
        elements.analyzeSubmitBtn.disabled = true;
        elements.btnSpinner.classList.remove('hidden');
        elements.progressContainer.classList.remove('hidden');
        
        // Mock multi-step progress bar transitions
        updateProgressBar(15, 'Establishing handshake connections with agent service layers...');

        try {
            setTimeout(() => updateProgressBar(45, 'Transmission of payload metrics to runtime core...'), 600);
            setTimeout(() => updateProgressBar(75, 'Awaiting structural validation extraction parsing...'), 1500);

            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: rawText.trim() })
            });

            updateProgressBar(90, 'Finalizing structured schema structural validations...');

            if (!response.ok) {
                const parseErrorPayload = await response.json().catch(() => ({ detail: 'Unknown structural failure protocol.' }));
                throw new Error(parseErrorPayload.detail || `Response error context status code: ${response.status}`);
            }

            const payloadResult = await response.json();
            currentAnalysisData = payloadResult;
            localStorage.setItem(
                "analysisData",
                JSON.stringify(payloadResult)
            );
            updateProgressBar(100, 'Operations process complete.');
            
            setTimeout(() => {
                renderAnalysisData(payloadResult);
                showNotification('Research analysis processing completely updated.', 'success');
                resetLoadingStates();
            }, 400);

        } catch (networkError) {
            const message = networkError?.message || 'Unable to complete analysis.';
            showNotification(message, 'error');
            console.error('Analysis request failed:', networkError);
            resetLoadingStates();
        }
    };

    const updateProgressBar = (percentage, statusText) => {
        elements.progressBarFill.style.width = `${percentage}%`;
        elements.progressStatusText.textContent = statusText;
    };

    const resetLoadingStates = () => {
        elements.analyzeSubmitBtn.disabled = false;
        elements.btnSpinner.classList.add('hidden');
        setTimeout(() => {
            elements.progressContainer.classList.add('hidden');
            elements.progressBarFill.style.width = '0%';
        }, 1000);
    };

    elements.analyzeSubmitBtn.addEventListener('click', executeAnalysisPipeline);

    /* ==========================================
     * DATA EXPORT EXPORT EXTRAPOLATION ACTIONS
     * ========================================== */
    // Segment Specific Component Copy Commands
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('section-copy-btn')) {
            const elementTargetId = e.target.getAttribute('data-target');
            const targetElement = document.getElementById(elementTargetId);
            if (!targetElement) return;

            let stringToCopy = '';
            if (targetElement.tagName === 'UL') {
                const listItems = Array.from(targetElement.querySelectorAll('li')).map(el => el.textContent);
                stringToCopy = listItems.join('\n');
            } else if (targetElement.classList.contains('keyword-pill-cloud')) {
                const pills = Array.from(targetElement.querySelectorAll('.keyword-pill')).map(el => el.textContent);
                stringToCopy = pills.join(', ');
            } else {
                stringToCopy = targetElement.textContent;
            }

            if (!stringToCopy) return showNotification('No context parameters found within selected block element structures.', 'error');

            navigator.clipboard.writeText(stringToCopy)
                .then(() => showNotification('Section text block elements cached to clipboard context.', 'success'))
                .catch(() => showNotification('Failed selection block cache extraction operation.', 'error'));
        }
    });

    elements.copyJsonBtn.addEventListener('click', () => {
        if (!currentAnalysisData) return;
        navigator.clipboard.writeText(JSON.stringify(currentAnalysisData, null, 4))
            .then(() => showNotification('Complete structural JSON schema payload buffered.', 'success'))
            .catch(() => showNotification('Data caching routine failed.', 'error'));
    });

    elements.exportJsonBtn.addEventListener('click', () => {
        if (!currentAnalysisData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysisData, null, 4));
        const triggerDownloadAnchor = document.createElement('a');
        triggerDownloadAnchor.setAttribute("href", dataStr);
        triggerDownloadAnchor.setAttribute("download", `analysis_report_${Date.now()}.json`);
        document.body.appendChild(triggerDownloadAnchor);
        triggerDownloadAnchor.click();
        triggerDownloadAnchor.remove();
        showNotification('File dynamic JSON object download initiated.', 'success');
    });

    elements.exportTxtBtn.addEventListener('click', () => {
        if (!currentAnalysisData) return;
        
        let formatTxtPayload = `==================================================\n`;
        formatTxtPayload += `STRUCTURAL INTELLIGENCE INTELLIGENCE REPORT AGENT\n`;
        formatTxtPayload += `Generated Timestamp: ${new Date().toISOString()}\n`;
        formatTxtPayload += `==================================================\n\n`;
        
        formatTxtPayload += `EXECUTIVE SUMMARY:\n${currentAnalysisData.summary}\n\n`;
        formatTxtPayload += `KEY TAKEAWAY PRINCIPLES:\n- ${currentAnalysisData.key_points.join('\n- ')}\n\n`;
        formatTxtPayload += `QUANTITATIVE TELEMETRY STATISTICS:\n- ${currentAnalysisData.statistics.join('\n- ')}\n\n`;
        formatTxtPayload += `IDENTIFIED ADVANTAGES AND STRENGTHS:\n- ${currentAnalysisData.advantages.join('\n- ')}\n\n`;
        formatTxtPayload += `STRUCTURAL RISKS & CHALLENGES:\n- ${currentAnalysisData.challenges.join('\n- ')}\n\n`;
        formatTxtPayload += `HORIZON LINE PROJECTIONS & FUTURE TRENDS:\n- ${currentAnalysisData.future_trends.join('\n- ')}\n\n`;
        formatTxtPayload += `INDEX KEYWORDS: ${currentAnalysisData.keywords.join(', ')}\n`;

        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(formatTxtPayload);
        const triggerDownloadAnchor = document.createElement('a');
        triggerDownloadAnchor.setAttribute("href", dataStr);
        triggerDownloadAnchor.setAttribute("download", `analytical_manifesto_${Date.now()}.txt`);
        document.body.appendChild(triggerDownloadAnchor);
        triggerDownloadAnchor.click();
        triggerDownloadAnchor.remove();
        showNotification('Analytical plain text log download initiated.', 'success');
    });

    // Run Framework Component Systems Inits
initThemeEngine();
updateInputMetrics();

// Load research automatically from previous page
const savedResearch = localStorage.getItem("researchData");

if (savedResearch) {
    const research = JSON.parse(savedResearch);

    elements.researchInput.value = `
Topic: ${research.topic}

Overview:
${research.overview}

Key Concepts:
${research.key_concepts.join(", ")}

Statistics:
${research.important_statistics.join(", ")}

Current Trends:
${research.current_trends.join(", ")}

Applications:
${research.applications.join(", ")}

Advantages:
${research.advantages.join(", ")}

Challenges:
${research.challenges.join(", ")}

Future Scope:
${research.future_scope.join(", ")}
`;

    // Update word & character count
    updateInputMetrics();

    // Automatically click Analyze
    // Automatically analyze and wait until it finishes
await executeAnalysisPipeline();
}
const goBtn = document.getElementById("goToWriterBtn");

if (goBtn) {
    goBtn.onclick = () => {
        window.location.href = "writer.html";
    };
}
});


