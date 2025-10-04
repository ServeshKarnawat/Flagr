document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  
  const resultElement = document.getElementById("result");
  resultElement.textContent = "Analyzing Terms of Service...";

  try {
  const response = await fetch("http://127.0.0.1:5000/compute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  let data;
  try {
    data = await response.json();
    } catch (err) {
      throw new Error("Flask returned invalid JSON: " + await response.text());
    }

    if (data.error) {
      resultElement.textContent = "Error: " + data.error;
    } else {
      resultElement.textContent = data.summary;
    }
  } catch (err) {
    resultElement.textContent = "Connection error: " + err.message;
  }
});