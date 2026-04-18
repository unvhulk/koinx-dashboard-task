import json
from groq import AsyncGroq
from config import settings

_client = AsyncGroq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a content strategist for KoinX, a crypto tax platform.
Create structured content outlines that a writer can immediately follow.
Respond with valid JSON only. No markdown, no explanation."""

USER_PROMPT = """Create a {content_type} outline for KoinX on this topic:
Topic: {topic}
Title: {title}

Return JSON with this exact structure:
{{
  "title": "final polished title",
  "intro": "one sentence that hooks the reader and states what they will learn",
  "sections": [
    {{
      "heading": "H2 section heading",
      "points": ["key point 1", "key point 2", "key point 3"]
    }}
  ],
  "conclusion": "one sentence call to action for the reader",
  "estimated_words": <integer: realistic word count estimate>
}}

Rules:
- 3-5 sections for blog, 4-6 sections for video script, 1-2 sections for social
- Points should be specific and actionable, not vague
- Title should be SEO-friendly and clear
- estimated_words: blog=800-1500, video=500-900 (script), social=100-200"""


def _parse_outline(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


async def generate_outline(topic: str, title: str, content_type: str) -> dict:
    prompt = USER_PROMPT.format(topic=topic, title=title, content_type=content_type)
    resp = await _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=1024,
    )
    return _parse_outline(resp.choices[0].message.content)
