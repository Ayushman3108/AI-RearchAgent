/**
 * State Management & UI Binding Engine for ReportWriterAgent
 */
document.addEventListener("DOMContentLoaded", () => {
    // Core API Endpoint Mapping Configuration
    const API_BASE_URL = "http://127.0.0.1:8000";

    // Application State Variables
    let compiledReportData = null;

    // DOM Element Node Selectors
    const nodes = {
        themeToggleBtn: document.getElementById("themeToggleBtn"),
        jsonInput: document.getElementById("jsonInput"),
        loadExampleBtn: document.getElementById("loadExampleBtn"),
        clearInputBtn: document.getElementById("clearInputBtn"),
        generateBtn: document.getElementById("generateBtn"),
        inputValidationBadge: document.getElementById("inputValidationBadge"),
        progressIndicator: document.getElementById("progressIndicator"),
        progressBar: document.getElementById("progressBar"),
        progressStatus: document.getElementById("progressStatus"),
        outputPanel: document.getElementById("outputPanel"),
        emptyState: document.getElementById("emptyState"),
        outputWrapper: document.getElementById("outputWrapper"),
        reportDocumentTitle: document.getElementById("reportDocumentTitle"),
        wordCountLabel: document.getElementById("wordCountLabel"),
        readingTimeLabel: document.getElementById("readingTimeLabel"),
        exportDropdownBtn: document.getElementById("exportDropdownBtn"),
        exportMenu: document.getElementById("exportMenu"),
        toastNotification: document.getElementById("toastNotification"),
        
        // Output Data Mount Points
        titleDisplay: document.getElementById("reportTitleDisplay"),
        abstractDisplay: document.getElementById("abstractDisplay"),
        introductionDisplay: document.getElementById("introductionDisplay"),
        mainContentDisplay: document.getElementById("mainContentDisplay"),
        advantagesDisplay: document.getElementById("advantagesDisplay"),
        challengesDisplay: document.getElementById("challengesDisplay"),
        futureScopeDisplay: document.getElementById("futureScopeDisplay"),
        conclusionDisplay: document.getElementById("conclusionDisplay"),
        referencesDisplay: document.getElementById("referencesDisplay"),

        // Download Element Targets
        downloadMdBtn: document.getElementById("downloadMdBtn"),
        downloadTxtBtn: document.getElementById("downloadTxtBtn"),
        downloadJsonBtn: document.getElementById("downloadJsonBtn"),
        copyFullReportBtn: document.getElementById("copyFullReportBtn")
    };

    // Concrete Structured Analysis Payload Stub
    const EXAMPLE_ANALYSIS_DATA = {
        "summary": "Comprehensive architectural structural migration study shifting from centralized monolithic orchestration nodes towards decoupled, mesh-networked autonomous edge processing topologies.",
        "key_points": [
            "Edge node distribution yields localized processing throughput advantages under heavy analytical demands.",
            "Elimination of cross-regional network backhauls dramatically limits structural telemetry latency profiles.",
            "Dynamic peer-to-peer connection clustering ensures robust execution failover behaviors."
        ],
        "statistics": [
            "Observed point-to-point payload transit latency dropped from 142ms down to a predictable 12ms sub-window.",
            "Central cloud database consumption costs mapped an automated reduction curve of roughly 34% post-cutover.",
            "Operational edge survival thresholds remained functional throughout localized network partitions up to 8 hours."
        ],
        "advantages": [
            "Near real-time computational velocity for interactive client applications.",
            "Hardened resilience capabilities matching severe geographical cloud hosting runtime disruptions.",
            "Localized cryptographic compliance enforcement capabilities mitigating global data leakage models."
        ],
        "challenges": [
            "Complex real-time eventual state reconciliation loops required to align isolated persistence boundaries.",
            "Increased hardware configuration surface area complicating broad firmware patch rollouts.",
            "Heterogeneous node environment profiles complicating linear profiling operations."
        ],
        "future_trends": [
            "Integration of highly optimized localized semantic models processing requests natively at the hardware board boundary.",
            "Automated protocol routing policies dynamically re-shaping cluster typologies ahead of regional power outages."
        ],
        "keywords": ["Edge Compute Topologies", "State Reconciliation Matrices", "Decoupled Architectures", "High Availability Network Meshes"]
    };

    /* --- Theme Core Operations --- */
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem("writer-theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    };

    nodes.themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("writer-theme", nextTheme);
    });

    /* --- Local Storage State Persistence --- */
    const loadPersistedInput = () => {
        const savedInput = localStorage.getItem("writer-input-cache");
        if (savedInput) {
            nodes.jsonInput.value = savedInput;
            validateJsonSyntax(savedInput);
        }
    };

    nodes.jsonInput.addEventListener("input", (e) => {
        const rawValue = e.target.value;
        localStorage.setItem("writer-input-cache", rawValue);
        validateJsonSyntax(rawValue);
    });

    /* --- Syntactic Data Validation Logic --- */
    function validateJsonSyntax(value) {
        if (!value.trim()) {
            updateBadge("Awaiting Input", "neutral");
            return false;
        }
        try {
            const parsed = JSON.parse(value);
            // Verify structural presence of minimal target arrays
            if (parsed.summary && Array.isArray(parsed.key_points)) {
                updateBadge("Valid Payload", "success");
                return true;
            } else {
                updateBadge("Invalid Structure", "danger");
                return false;
            }
        } catch (err) {
            updateBadge("Invalid JSON Syntax", "danger");
            return false;
        }
    }

    function updateBadge(text, type) {
        nodes.inputValidationBadge.textContent = text;
        nodes.inputValidationBadge.className = `badge badge-${type}`;
    }

    /* --- User Action Routing Events --- */
    nodes.loadExampleBtn.addEventListener("click", () => {
        const formattedExample = JSON.stringify(EXAMPLE_ANALYSIS_DATA, null, 2);
        nodes.jsonInput.value = formattedExample;
        localStorage.setItem("writer-input-cache", formattedExample);
        validateJsonSyntax(formattedExample);
        showToast("Example analysis workspace initialized.");
    });

    nodes.clearInputBtn.addEventListener("click", () => {
        nodes.jsonInput.value = "";
        localStorage.removeItem("writer-input-cache");
        validateJsonSyntax("");
        showToast("Workspace wiped clean.");
    });

    // Close Dropdown menus upon framing outside components
    window.addEventListener("click", (e) => {
        if (!nodes.exportDropdownBtn.contains(e.target)) {
            nodes.exportMenu.classList.add("hidden");
        }
    });

    nodes.exportDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nodes.exportMenu.classList.toggle("hidden");
    });

    /* --- Toast Notification Utility --- */
    function showToast(message) {
        nodes.toastNotification.textContent = message;
        nodes.toastNotification.classList.remove("hidden");
        setTimeout(() => {
            nodes.toastNotification.classList.add("hidden");
        }, 3000);
    }

    /* --- Document Analytics Aggregators --- */
    function updateDocumentMetadata(markdownString) {
        const wordCount = markdownString.split(/\s+/).filter(w => w.length > 0).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 225)); // Standard baseline evaluation rate

        nodes.wordCountLabel.textContent = wordCount.toLocaleString();
        nodes.readingTimeLabel.textContent = `${readingTime} min`;
    }

    /* --- Structural Rendering Execution Pipe --- */
    function renderGeneratedReport(data) {
        compiledReportData = data;

        // Populate targeted tracking points
        nodes.reportDocumentTitle.textContent = data.title;
        nodes.titleDisplay.textContent = data.title;
        nodes.abstractDisplay.textContent = data.abstract;
        nodes.introductionDisplay.textContent = data.introduction;
        nodes.mainContentDisplay.textContent = data.main_content;
        nodes.advantagesDisplay.textContent = data.advantages_section;
        nodes.challengesDisplay.textContent = data.challenges_section;
        nodes.futureScopeDisplay.textContent = data.future_scope;
        nodes.conclusionDisplay.textContent = data.conclusion;

        // Build cleanly formatted Reference Item list arrays
        nodes.referencesDisplay.innerHTML = "";
        const referenceOl = document.createElement("ol");
        referenceOl.style.paddingLeft = "1.25rem";
        data.references.forEach(ref => {
            const li = document.createElement("li");
            li.textContent = ref;
            li.style.marginBottom = "0.5rem";
            referenceOl.appendChild(li);
        });
        nodes.referencesDisplay.appendChild(referenceOl);

        // Calculate metadata updates
        updateDocumentMetadata(data.markdown);

        // Adjust visibility viewport structures
        nodes.emptyState.classList.add("hidden");
        nodes.outputPanel.classList.remove("empty");
        nodes.outputWrapper.classList.remove("hidden");
        
        // Core Viewport Auto Scroll Adjustment Focus
        nodes.outputPanel.scrollIntoView({ behavior: "smooth" });
    }

    /* --- Core API Network Transport Logic --- */
    async function executeReportGeneration() {
        const rawInput = nodes.jsonInput.value.trim();
        if (!validateJsonSyntax(rawInput)) {
            showToast("Error: Correct structure errors before generating.");
            return;
        }

        // Configure UI Loading States
        nodes.generateBtn.disabled = true;
        nodes.generateBtn.querySelector(".btn-text").textContent = "Processing Core Assets...";
        nodes.generateBtn.querySelector(".loader").classList.remove("hidden");
        nodes.progressIndicator.classList.remove("hidden");
        
        // Trigger Progressive Status Emulation Blocks
        updateProgressBar(25, "Assembling input variables and validating payloads...");

        try {
            const parsedPayload = JSON.parse(rawInput);
            
            setTimeout(() => {
                updateProgressBar(60, "Running analysis transformation maps via LLM layers...");
            }, 800);

            const response = await fetch(`${API_BASE_URL}/write-report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parsedPayload)
            });

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => ({ detail: "Unknown network event encountered." }));
                throw new Error(errorPayload.detail || `Server returned error status code: ${response.status}`);
            }

            updateProgressBar(90, "Assembling raw response streams and generating markdown layout...");
            const resultData = await response.json();
            localStorage.setItem(
                "reportData",
                JSON.stringify(resultData)
            );
            setTimeout(() => {
                renderGeneratedReport(resultData);
                showToast("Academic document compiled successfully!");
                cleanupLoadingStates();
            }, 400);

        } catch (networkError) {
            console.error(networkError);
            showToast(`Execution Fault: ${networkError.message}`);
            cleanupLoadingStates();
        }
    }

    function updateProgressBar(percentage, message) {
        nodes.progressBar.style.width = `${percentage}%`;
        nodes.progressStatus.textContent = message;
    }

    function cleanupLoadingStates() {
        nodes.generateBtn.disabled = false;
        nodes.generateBtn.querySelector(".btn-text").textContent = "Generate Academic Report";
        nodes.generateBtn.querySelector(".loader").classList.add("hidden");
        nodes.progressIndicator.classList.add("hidden");
        nodes.progressBar.style.width = "0%";
    }

    nodes.generateBtn.addEventListener("click", executeReportGeneration);

    /* --- Advanced Feature Operations (Hotkeys & Clipboard Handles) --- */
    // Global Keyboard Shortcut Bindings (Ctrl + Enter)
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            if (!nodes.generateBtn.disabled) {
                e.preventDefault();
                executeReportGeneration();
            }
        }
    });

    // Granular Copy Engine Event Routing Delegations
    document.body.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-copy-section")) {
            const targetedDisplayNodeId = e.target.getAttribute("data-target");
            const element = document.getElementById(targetedDisplayNodeId);
            if (element) {
                navigator.clipboard.writeText(element.innerText).then(() => {
                    showToast("Section copied to clipboard.");
                });
            }
        }
    });

    nodes.copyFullReportBtn.addEventListener("click", () => {
        if (!compiledReportData) return;
        navigator.clipboard.writeText(compiledReportData.markdown).then(() => {
            showToast("Entire Markdown report copied to clipboard.");
        });
    });

    /* --- Local File System Extraction Pipeline --- */
    function triggerFileDownload(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    nodes.downloadMdBtn.addEventListener("click", () => {
        if (!compiledReportData) return;
        triggerFileDownload(compiledReportData.markdown, "research_report.md", "text/markdown");
    });

    nodes.downloadTxtBtn.addEventListener("click", () => {
        if (!compiledReportData) return;
        // Strip markdown header characters neatly to make flat txt presentation
        const cleanTxt = compiledReportData.markdown.replace(/#+\s/g, "");
        triggerFileDownload(cleanTxt, "research_report.txt", "text/plain");
    });

    nodes.downloadJsonBtn.addEventListener("click", () => {
        if (!compiledReportData) return;
        triggerFileDownload(JSON.stringify(compiledReportData, null, 2), "report_export.json", "application/json");
    });

// Global Initialization Pipelines
initializeTheme();
loadPersistedInput();

// Auto-load analysis data from Analysis page
const savedAnalysis = localStorage.getItem("analysisData");

if (savedAnalysis) {
    nodes.jsonInput.value = JSON.stringify(
        JSON.parse(savedAnalysis),
        null,
        2
    );

    localStorage.setItem("writer-input-cache", nodes.jsonInput.value);
    validateJsonSyntax(nodes.jsonInput.value);
}
const goToWriterBtn = document.getElementById("goToWriterBtn");

if (goToWriterBtn) {
    goToWriterBtn.onclick = () => {
        window.location.href = "reviewer.html";
    };
}
});