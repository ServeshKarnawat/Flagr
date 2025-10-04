from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig
import os

client = genai.Client(api_key=os.getenv("GEMINI_API"))
def gemini(url):
    model_id = "gemini-2.5-flash"
    tools = [
        types.Tool(
            google_search=types.GoogleSearch()
        )
    ]

    response = client.models.generate_content(
        model=model_id,
        contents=f"""Read the terms of service at {url} and summarize the key points in the following structured format:
        1. Overall Score (1-10) including decimals, 2. Red Flags (if any) 3. Green Flags (if any) 4. Summary of Terms of Service""",
        config=GenerateContentConfig(
            tools=tools,
        )
    )
    result = ""
    for each in response.candidates[0].content.parts:
        result += each.text
    return result

url = "https://help.instagram.com/581066165581870/"
print(gemini(url))
