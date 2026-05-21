"""AI Copilot service — calls OpenRouter using httpx (no openai SDK needed)."""
import httpx

from app.core.config import settings

_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
_DEFAULT_MODEL = "moonshotai/kimi-k2"
_TIMEOUT = 60.0

_SYSTEM_PROMPT = """You are DClaw Migrate Copilot, an expert data and cloud migration assistant.
You help engineers plan, execute, and validate database and infrastructure migrations.

Your capabilities:
- Explain migration strategies (lift-and-shift, re-platform, refactor)
- Identify schema incompatibilities between source and target databases
- Suggest data type mappings and transformation rules
- Assess migration risks and recommend mitigations
- Guide cutover planning and rollback strategies

Be concise, practical, and specific. When you identify a risk, always give a concrete mitigation step.
If asked about a specific migration job, use the context provided."""


async def chat(
    messages: list[dict],
    model: str = _DEFAULT_MODEL,
) -> str:
    if not settings.openrouter_api_key:
        return (
            "⚠️ OPENROUTER_API_KEY is not configured. "
            "Add it to your .env file to enable the AI Copilot."
        )

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            _BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "HTTP-Referer": "https://dclaw.io",
                "X-Title": "DClaw Migrate",
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def build_system_message(job_context: dict | None = None) -> dict:
    content = _SYSTEM_PROMPT
    if job_context:
        content += f"\n\n--- Current Job Context ---"
        content += f"\nJob: {job_context.get('name')} ({job_context.get('migration_type')})"
        content += f"\nStatus: {job_context.get('status')}"
        if job_context.get("source"):
            content += f"\nSource: {job_context['source']}"
        if job_context.get("target"):
            content += f"\nTarget: {job_context['target']}"
        if job_context.get("tables"):
            content += f"\nMapped tables: {', '.join(job_context['tables'][:10])}"
    return {"role": "system", "content": content}
