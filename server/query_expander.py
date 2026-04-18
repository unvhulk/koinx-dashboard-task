import json
from groq import AsyncGroq
from config import settings

_client = AsyncGroq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a YouTube search expert.
Given a topic, generate search query variants that will find videos where users ask questions in the comments.
Respond with valid JSON only. No markdown, no explanation."""

USER_PROMPT = """Generate 4-5 YouTube search query variants for this topic: "{tag}"

Rules:
- Each variant should target a different angle (beginner confusion, deadline/penalty, how-to, calculator, specific scenario)
- Queries should be specific enough to find relevant videos with engaged comment sections
- Keep each query under 10 words
- Do NOT repeat the original tag verbatim as a variant

Return JSON:
{{"queries": ["query 1", "query 2", "query 3", "query 4", "query 5"]}}"""


def _parse_queries(raw: str) -> list[str]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    queries = json.loads(raw).get("queries", [])
    seen: set[str] = set()
    result = []
    for q in queries:
        q = q.strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            result.append(q)
    return result


async def expand_query(tag: str) -> list[str]:
    try:
        resp = await _client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT.format(tag=tag)},
            ],
            temperature=0,
            max_tokens=256,
        )
        queries = _parse_queries(resp.choices[0].message.content)
        return [tag] + queries if queries else [tag]
    except Exception:
        return [tag]
