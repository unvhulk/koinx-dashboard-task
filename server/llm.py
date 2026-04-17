import re
import json
from groq import AsyncGroq
from config import settings
from models import Insight, Source, ContentType, Sentiment, Platform

_client = AsyncGroq(api_key=settings.groq_api_key)

BATCH_SIZE = 50
MIN_WORDS = 6
MIN_CHARS = 30
MERGE_SIMILARITY_THRESHOLD = 0.45

SYSTEM_PROMPT = """You are a content strategist for KoinX, a crypto tax and accounting platform.
Your job: analyze user comments and identify content opportunities for the KoinX content team.
Always respond with valid JSON only. No markdown, no explanation."""

USER_PROMPT_TEMPLATE = """Analyze these {platform} comments about "{tag}".
Find the real questions and frustrations people have. These will become content ideas for a crypto tax platform.

Return JSON with this exact structure:
{{
  "topics": [
    {{
      "topic": "the actual question or pain point people have (max 8 words, written as a question or problem — NOT a category name)",
      "content_type": "blog" or "video" or "social",
      "frequency": <integer: how many comments relate to this topic>,
      "sentiment": "confused" or "concerned" or "curious" or "positive",
      "suggested_title": "a specific, ready-to-use title for a blog post or video on this topic",
      "example_quotes": ["verbatim quote from comments", "another verbatim quote"]
    }}
  ]
}}

Rules:
- Return 3-8 topics maximum
- topic must sound like a real person's question or problem, NOT a category label
  BAD: "Tax Lot Selection", "Exit Strategy", "Crypto Tax Software"
  GOOD: "Which tax lot method saves the most money?", "Do I owe tax if I haven't sold yet?", "How do I report a crypto loss?"
- Merge similar or overlapping topics — no near-duplicates
- content_type: "video" = step-by-step walkthroughs, "blog" = detailed explainers/FAQs, "social" = short tips or myth-busting
- example_quotes must be verbatim from the comments below — do not paraphrase
- frequency must be a positive integer
- Skip greetings, single reactions, off-topic comments

Comments:
{comments}"""


def _is_quality_comment(text: str) -> bool:
    cleaned = re.sub(r'[^\w\s]', '', text, flags=re.UNICODE)
    words = [w for w in cleaned.split() if len(w) > 1]
    return len(words) >= MIN_WORDS and len(text) >= MIN_CHARS


def _filter_comments(comments: list[str]) -> list[str]:
    return [c for c in comments if _is_quality_comment(c)]


def _parse_response(raw: str) -> list[dict]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw).get("topics", [])


async def _call_llm(tag: str, comments: list[str], platform: str) -> list[dict]:
    joined = "\n".join(f"- {c}" for c in comments)
    prompt = USER_PROMPT_TEMPLATE.format(tag=tag, platform=platform, comments=joined)
    resp = await _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=2048,
    )
    return _parse_response(resp.choices[0].message.content)


def _word_overlap(a: str, b: str) -> float:
    wa = set(a.lower().split())
    wb = set(b.lower().split())
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / min(len(wa), len(wb))


def _merge_topics(all_topics: list[dict]) -> list[dict]:
    merged: list[dict] = []

    for topic in all_topics:
        matched = False
        for existing in merged:
            if _word_overlap(topic["topic"], existing["topic"]) >= MERGE_SIMILARITY_THRESHOLD:
                existing["frequency"] += topic.get("frequency", 1)
                existing["example_quotes"].extend(topic.get("example_quotes", []))
                matched = True
                break
        if not matched:
            merged.append(dict(topic))

    result = sorted(merged, key=lambda x: x["frequency"], reverse=True)[:10]
    for t in result:
        t["example_quotes"] = list(dict.fromkeys(t["example_quotes"]))[:3]
    return result


async def extract_insights(
    tag: str,
    comments: list[str],
    platform: Platform,
    sources: list[Source] | None = None,
) -> list[Insight]:
    quality_comments = _filter_comments(comments)
    batches = [quality_comments[i:i + BATCH_SIZE] for i in range(0, len(quality_comments), BATCH_SIZE)]
    all_topics: list[dict] = []

    for batch in batches:
        try:
            topics = await _call_llm(tag, batch, platform.value)
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
                sources=sources or [],
            ))
        except Exception:
            continue

    return insights
