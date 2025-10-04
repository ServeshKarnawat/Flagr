from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig
import os

app = Flask(__name__)
CORS(app)

# Initialize Gemini client once
api_key = os.getenv("GEMINI_API")
if not api_key:
    raise RuntimeError("GEMINI_API environment variable not set")

client = genai.Client(api_key=api_key)

def summarize_terms(url):
    """Use Gemini to summarize Terms of Service at a given URL."""
    model_id = "gemini-2.5-flash"
    tools = [types.Tool(google_search=types.GoogleSearch())]

    response = client.models.generate_content(
        model=model_id,
        contents=f"""
        Read the terms of service at {url} and summarize the key points in this format:
        1. Overall Score (1–10)
        2. Red Flags (if any)
        3. Green Flags (if any)
        4. Summary of Terms of Service
        """,
        config=GenerateContentConfig(tools=tools)
    )

    # Combine text parts
    text = ""
    for part in response.candidates[0].content.parts:
        if hasattr(part, "text"):
            text += part.text
    return text.strip()


@app.route('/compute', methods=['POST'])
def compute():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    try:
        summary = summarize_terms(url)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
