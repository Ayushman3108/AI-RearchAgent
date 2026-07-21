// Global State
let currentResearchData = null;
const API_URL = "http://localhost:8000/research";

// DOM Elements
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const topicInput = document.getElementById('topic-input');
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');
const researchBtn = document.getElementById('research-btn');
const historyChips = document.getElementById('history-chips');

const loadingSection = document.getElementById('loading-section');
const progressMessage = document.getElementById('progress-message');
const resultsSection = document.getElementById('results-section');
const timestampEl = document.getElementById('timestamp');
const toastEl = document.getElementById('toast');

// Action Buttons
const copyAllBtn = document.getElementById('copy-all-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const downloadTxtBtn = document.getElementById('download-txt-btn');
const clearBtn = document.getElementById('clear-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("research.js loaded");
    console.log(localStorage.getItem("researchData"));

    initTheme();
    loadHistory();
    setupEventListeners();

    // Load research data from Home page
    const savedResearch = localStorage.getItem("researchData");

    if (savedResearch) {
        currentResearchData = JSON.parse(savedResearch);

        topicInput.value = currentResearchData.topic;
        topicInput.dispatchEvent(new Event("input"));

        renderResults(currentResearchData);
    }
});
function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Input Counters
    topicInput.addEventListener('input', () => {
        const text = topicInput.value;
        charCount.textContent = `${text.length} characters`;
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        wordCount.textContent = `${words} words`;
    });

    // Main Research Action
    researchBtn.addEventListener('click', handleResearch);
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleResearch();
    });

    // Toolbar Actions
    clearBtn.addEventListener('click', clearResults);
    copyAllBtn.addEventListener('click', copyAllResults);
    exportJsonBtn.addEventListener('click', exportJSON);
    downloadTxtBtn.addEventListener('click', downloadTXT);

    // Individual Card Copy
    document.querySelectorAll('.copy-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            const content = document.getElementById(targetId).innerText;
            copyToClipboard(content, 'Section copied!');
        });
    });
}

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
    }
}

function toggleTheme() {
    const isDark = body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
    }
}

// --- API & Core Logic ---
async function handleResearch() {
    const topic = topicInput.value.trim();
    if (!topic) {
        showToast('Please enter a research topic.', true);
        return;
    }

    // UI Updates for Loading
    topicInput.disabled = true;
    researchBtn.disabled = true;
    resultsSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    
    // Simulate progress updates
    const messages = [
        "Analyzing topic parameters...",
        "Querying global knowledge base...",
        "Synthesizing factual data...",
        "Structuring research sections...",
        "Finalizing JSON payload..."
    ];
    let msgIndex = 0;
    const progressInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        progressMessage.textContent = messages[msgIndex];
    }, 2000);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to fetch research data');
        }

        const data = await response.json();
        currentResearchData = data;
        
        saveToHistory(data.topic);
        renderResults(data);
        showToast('Research complete!');

    } catch (error) {
        console.error("Research Error:", error);
        showToast(`Error: ${error.message}`, true);
    } finally {
        clearInterval(progressInterval);
        topicInput.disabled = false;
        researchBtn.disabled = false;
        loadingSection.classList.add('hidden');
    }
}

// --- Rendering Logic ---
function renderResults(data) {
    resultsSection.classList.remove('hidden');
    
    // Set Timestamp
    const now = new Date();
    timestampEl.textContent = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

    // Helper to render lists
    const renderList = (arr = []) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return "<p>No data available.</p>";
    }
     return `<ul>${arr.map(item => `<li>${item}</li>`).join("")}</ul>`;
};
    // Populate Cards
    document.getElementById('concepts-content').innerHTML = renderList(data.key_concepts);
    document.getElementById('stats-content').innerHTML = renderList(data.important_statistics);
    document.getElementById('trends-content').innerHTML = renderList(data.current_trends);
    document.getElementById('apps-content').innerHTML = renderList(data.applications);
    document.getElementById('adv-content').innerHTML = renderList(data.advantages);
    document.getElementById('challenges-content').innerHTML = renderList(data.challenges);
    document.getElementById('future-content').innerHTML = renderList(data.future_scope);
    document.getElementById('references-content').innerHTML = renderList(data.references);

    // Apply Typing Animation to Overview
    const overviewEl = document.getElementById('overview-content');
    overviewEl.innerHTML = '';
    typeWriterEffect(overviewEl, data.overview, 10);
}

function typeWriterEffect(element, text, speed) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typing-container'); // remove blinking cursor when done
        }
    }
    element.classList.add('typing-container');
    type();
}

// --- History Management ---
function saveToHistory(topic) {
    let history = JSON.parse(localStorage.getItem('researchHistory') || '[]');
    // Remove if exists to push to top
    history = history.filter(t => t.toLowerCase() !== topic.toLowerCase());
    history.unshift(topic);
    if (history.length > 5) history.pop(); // Keep only last 5
    localStorage.setItem('researchHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('researchHistory') || '[]');
    historyChips.innerHTML = history.map(topic => 
        `<div class="chip" onclick="setTopic('${topic.replace(/'/g, "\\'")}')">${topic}</div>`
    ).join('');
}

window.setTopic = function(topic) {
    topicInput.value = topic;
    // Trigger input event to update counters
    topicInput.dispatchEvent(new Event('input'));
};

// --- Export & Utilities ---
function clearResults() {
    currentResearchData = null;
    resultsSection.classList.add('hidden');
    topicInput.value = '';
    topicInput.dispatchEvent(new Event('input'));
}

async function copyAllResults() {
    if (!currentResearchData) return;
    let txt = `Research Topic: ${currentResearchData.topic}\n\n`;
    txt += `OVERVIEW:\n${currentResearchData.overview}\n\n`;
    txt += `KEY CONCEPTS:\n${currentResearchData.key_concepts.join('\n- ')}\n\n`;
    // Add other fields similarly for TXT representation
    
    await copyToClipboard(txt, 'All results copied!');
}

async function copyToClipboard(text, successMsg) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMsg);
    } catch (err) {
        showToast('Failed to copy', true);
    }
}

function exportJSON() {
    if (!currentResearchData) return;
    const dataStr = JSON.stringify(currentResearchData, null, 2);
    downloadFile(dataStr, `${currentResearchData.topic.replace(/\s+/g, '_')}_research.json`, 'application/json');
}

function downloadTXT() {
    if (!currentResearchData) return;
    let txt = `Research Topic: ${currentResearchData.topic}\n\n`;
    txt += `OVERVIEW:\n${currentResearchData.overview}\n\n`;
    Object.keys(currentResearchData).forEach(key => {
        if(key !== 'topic' && key !== 'overview') {
            const formattedKey = key.replace('_', ' ').toUpperCase();
            txt += `${formattedKey}:\n- ${currentResearchData[key].join('\n- ')}\n\n`;
        }
    });
    downloadFile(txt, `${currentResearchData.topic.replace(/\s+/g, '_')}_report.txt`, 'text/plain');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

function showToast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.style.backgroundColor = isError ? 'var(--danger)' : 'var(--text-color)';
    toastEl.classList.remove('hidden');
    
    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

const nextBtn = document.getElementById("goToWriterBtn");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        window.location.href = "analysis.html";
    });
}