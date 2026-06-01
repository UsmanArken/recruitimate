# Multi-provider LLM configuration

Recruitimate routes all **chat JSON** intelligence (talent, interview, decision, LinkedIn normalize) through a single abstraction in `src/lib/llm/`.

## Providers

| Provider | Env key | Default model |
|----------|---------|----------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-3-5-haiku-latest` |
| Google Gemini | `GOOGLE_API_KEY` or `GEMINI_API_KEY` | `gemini-2.0-flash` |

## Selection

```env
LLM_PROVIDER=auto   # recommended — first provider with a valid API key
# LLM_PROVIDER=openai | anthropic | google   # force a specific vendor
```

Priority when `auto`: OpenAI → Anthropic → Google.

If no key is configured, engines use **heuristic fallbacks** (local dev without spend).

## Transcription

Interview recording → text uses **OpenAI Whisper** only:

```env
TRANSCRIPTION_PROVIDER=openai   # default
OPENAI_API_KEY=sk-...
```

Set `TRANSCRIPTION_PROVIDER=none` to disable uploads/transcribe endpoints without a key.

## Code

- `chatJson()` — `src/lib/llm/runtime.ts`
- Provider adapters — `src/lib/llm/providers/*`
- Legacy import — `src/lib/intelligence/ai.ts` re-exports the same API

Adding a new vendor: implement `LlmChatProvider`, register in `src/lib/llm/registry.ts`, extend `LlmProviderId` and env schema.
