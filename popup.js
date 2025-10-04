const riskFlag = document.getElementById('risk-flag');
const progress = document.getElementById('progress-fill');
const percentText = document.getElementById('percent');
const learnMoreBtn = document.getElementById('learn-more-btn');
// NEW: Element to display the risk text
const riskText = document.getElementById('risk-text'); 

let fullSummary = ""; // full text from Flask
let expanded = false;

document.addEventListener("DOMContentLoaded", async () => {
  const resultElement = document.getElementById("result");
  resultElement.textContent = "Analyzing Terms of Service...";

  try {
    // Get the current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Call Flask backend
    const response = await fetch("http://127.0.0.1:5000/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    // Read the response body once
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error("Flask returned invalid JSON: " + text);
    }

    if (data.error) {
      resultElement.textContent = "Error: " + data.error;
      setFlagError();
      return;
    }

    // Success: store full summary
    fullSummary = data.summary;
    resultElement.textContent = ""; // clear placeholder

    // Extract score (assumes "Overall Score: X" or "X/10" format)
    const scoreMatch = fullSummary.match(/([0-9]+(?:\.[0-9]+)?)(?:\s*\/\s*10)?/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    if (score !== null) {
      updateRiskUI(score);
    } else {
      console.warn("Could not parse score, defaulting to moderate");
      updateRiskUI(5); // fallback
    }

  } catch (err) {
    console.error(err);
    resultElement.textContent = "Connection error: " + err.message;
    setFlagError();
  }
});

// ------------------------------------
// --- Update UI based on score ---
// ------------------------------------
function updateRiskUI(score) {
  const progressValue = Math.round((score / 10) * 100);
  let riskClassification = "";

  // Determine color class and text classification
  const flagClass =
    score < 4 ? "risk-high" :
    score < 7 ? "risk-moderate" :
    "risk-low";

  // Determine the DANGER/CAUTION/SAFE text based on the requirements
  if (score >= 1 && score <= 3) {
    riskClassification = "DANGER";
  } else if (score >= 4 && score < 7) {
    riskClassification = "CAUTION";
  } else if (score >= 7 && score <= 10) {
    riskClassification = "SAFE";
  } else {
    // Should not happen if score is parsed correctly, but good for robustness
    riskClassification = "UNKNOWN"; 
  }

  riskFlag.classList.remove("risk-high", "risk-moderate", "risk-low");
  riskFlag.classList.add(flagClass);
  riskFlag.textContent = score.toFixed(1);
  riskFlag.title = `Overall Score: ${score.toFixed(1)}`;

  // Set the new risk text
  riskText.textContent = riskClassification; 
  
  progress.style.width = progressValue + "%";
  percentText.textContent = progressValue + "%";

  learnMoreBtn.style.display = "block";
}

// ------------------------------------
// --- Show error flag ---
// ------------------------------------
function setFlagError() {
  riskFlag.classList.remove("risk-high", "risk-moderate", "risk-low");
  riskFlag.classList.add("risk-high");
  riskFlag.textContent = "!";
  riskFlag.title = "Error fetching score";
  
  // Update the risk text on error
  riskText.textContent = "ERROR";

  progress.style.width = "0%";
  percentText.textContent = "Error";
  learnMoreBtn.style.display = "none";
}

// ------------------------------------
// --- Learn More Button ---
// ------------------------------------
learnMoreBtn.addEventListener("click", () => {
  let existing = document.getElementById("full-summary");

  if (!existing) {
    existing = document.createElement("div");
    existing.id = "full-summary";
    existing.style.marginTop = "10px";
    existing.style.padding = "10px";
    existing.style.background = "#fff";
    existing.style.borderRadius = "5px";
    existing.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    existing.style.maxHeight = "0px";
    existing.style.overflow = "hidden";
    existing.style.transition = "max-height 0.3s ease";
    document.body.appendChild(existing);
  }

  if (!expanded) {
    existing.textContent = fullSummary;
    existing.style.maxHeight = "400px";
    learnMoreBtn.textContent = "Hide Details";
  } else {
    existing.style.maxHeight = "0px";
    learnMoreBtn.textContent = "Learn More";
  }

  expanded = !expanded;
});