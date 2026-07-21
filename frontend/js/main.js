document.addEventListener('DOMContentLoaded', () => {

  const topic = document.getElementById('topic');
  const charCount = document.getElementById('charCount');
  const reportList = document.getElementById('reportList');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const themeBtn = document.getElementById('themeBtn');

  /* Character counter */
  const updateCharCount = () => {
    charCount.textContent = topic.value.length;
  };
  updateCharCount();
  topic.addEventListener('input', updateCharCount);

  /* Report item expand */
  reportList.addEventListener('click', (e) => {
    const item = e.target.closest('.report-item');
    if (!item) return;
    item.classList.toggle('expanded');
    const desc = item.querySelector('.report-desc');
    desc.style.whiteSpace = item.classList.contains('expanded') ? 'normal' : 'nowrap';
  });

  /* Generate Report button */
  generateBtn.addEventListener("click", async () => {

    const researchTopic = topic.value.trim();

    if (!researchTopic) {
        alert("Please enter a research topic.");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = "Launching Research Agent...";

    try {

        const response = await fetch("http://127.0.0.1:8000/research", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: researchTopic
            })
        });

        const data = await response.json();
        if (!response.ok) {
          alert("AI service is temporarily unavailable. Please try again later.");
          console.error(data.detail); // Keep the real error in the console
          return;
        }
        localStorage.setItem("researchData", JSON.stringify(data));
        window.location.assign("research.html");

    } catch (error) {

        console.error(error);
        alert("Backend connection failed.");

    } finally {

        generateBtn.disabled = false;
        generateBtn.innerHTML = "Generate Report";

      }

});

  /* Copy button */
  copyBtn.addEventListener('click', () => {
    const sections = Array.from(document.querySelectorAll('.report-item')).map(item => {
      const title = item.querySelector('.report-title').textContent;
      const desc = item.querySelector('.report-desc').textContent;
      return `${title}\n${desc}`;
    }).join('\n\n');

    navigator.clipboard.writeText(sections).then(() => {
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = '✅ Copied';
      setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
    }).catch(() => {
      alert('Could not copy to clipboard.');
    });
  });

  /* Download PDF button (placeholder action) */
  downloadBtn.addEventListener('click', () => {
    const original = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '⬇️ Preparing...';
    setTimeout(() => {
      downloadBtn.innerHTML = original;
      alert('Your report PDF would be downloaded here.');
    }, 1000);
  });

  /* Theme switch */
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
  });

});
