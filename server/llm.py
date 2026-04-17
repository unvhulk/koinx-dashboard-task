import json
from groq import Groq
from config import settings
from models import Insight, ContentType, Sentiment, Platform

_client = Groq(api_key=settings.groq_api_key)

BATCH_SIZE = 50

SYSTEM_PROMPT = """You are a content strategist for KoinX, a crypto tax and accounting platform.
Your job: analyze user comments and identify content opportunities for the KoinX content team.
Always respond with valid JSON only. No markdown, no explanation."""

USER_PROMPT_TEMPLATE = """Analyze these {platform} comments about "{tag}".
Identify pain points, questions, and content opportunities.

Return JSON with this exact structure:
{{
  "topics": [
    {{
      "topic": "short descriptive label (max 6 words)",
      "content_type": "blog" or "video" or "social",
      "frequency": <integer: how many comments relate to this topic>,
      "sentiment": "confused" or "concerned" or "curious" or "positive",
      "suggested_title": "specific, actionable content title",
      "example_quotes": ["quote1", "quote2"]
    }}
  ]
}}

Rules:
- Return 3-8 topics maximum
- content_type "video" = tutorials/walkthroughs, "blog" = explainers/FAQs, "social" = quick tips/polls
- example_quotes must be verbatim excerpts from the comments below
- frequency must be a positive integer

Comments:
{comments}"""


def _parse_response(raw: str) -> list[dict]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw).get("topics", [])


def _call_llm(tag: str, comments: list[str], platform: str) -> list[dict]:
    joined = "\n".join(f"- {c}" for c in comments)
    prompt = USER_PROMPT_TEMPLATE.format(tag=tag, platform=platform, comments=joined)
    resp = _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=2048,
    )
    return _parse_response(resp.choices[0].message.content)


def _merge_topics(all_topics: list[dict]) -> list[dict]:
    """Merge duplicate topics across batches, summing frequency."""
    merged: dict[str, dict] = {}
    for t in all_topics:
        key = t["topic"].lower()
        if key in merged:
            merged[key]["frequency"] += t.get("frequency", 1)
            merged[key]["example_quotes"].extend(t.get("example_quotes", []))
        else:
            merged[key] = dict(t)
    # Keep top 10 by frequency, cap quotes at 3
    result = sorted(merged.values(), key=lambda x: x["frequency"], reverse=True)[:10]
    for t in result:
        t["example_quotes"] = t["example_quotes"][:3]
    return result


def extract_insights(tag: str, comments: list[str], platform: Platform) -> list[Insight]:
    batches = [comments[i:i + BATCH_SIZE] for i in range(0, len(comments), BATCH_SIZE)]
    all_topics: list[dict] = []

    for batch in batches:
        try:
            topics = _call_llm(tag, batch, platform.value)
            all_topics.extend(topics)
        except Exception:
            continue

    merged = _merge_topics(all_topics)

    insights = []
    for t in merged:
        try:
            insights.append(Insight(
                topic=t["topic"],
                content_type=ContentType(t.get("content_type", "blog")),
                frequency=int(t.get("frequency", 1)),
                sentiment=Sentiment(t.get("sentiment", "curious")),
                suggested_title=t.get("suggested_title", t["topic"]),
                example_quotes=t.get("example_quotes", []),
                platform=platform,
            ))
        except Exception:
            continue

    return insights
