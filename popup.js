document.addEventListener("DOMContentLoaded", async () => {
  const resultElement = document.getElementById("result");
  const url = "https://example.com/terms";  // 👈 You can change this or make it dynamic

  resultElement.textContent = "Analyzing Terms of Service using Gemini...";

  try {
    const response = await fetch("http://127.0.0.1:5000/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (data.error) {
      resultElement.textContent = "Error: " + data.error;
    } else {
      resultElement.textContent = data.summary;
    }
  } catch (err) {
    resultElement.textContent = "Error connecting to backend: " + err.message;
  }
});
