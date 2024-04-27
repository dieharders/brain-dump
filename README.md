# 🍺 Obrew Studio - WebUI

An Ai engineer's tool for building custom Ai agents and workflows for use in your own applications or everyday life.

<!-- https://github.com/vercel-labs/ai-chatbot -->

## Features Roadmap

- ✅ Run open source models locally for free
- ✅ Streaming chat UI
- ✅ Chat with your documents (RAG)
- ✅ Build custom bots from a mix of LLM's, software configs and prompt configs
- ✅ CPU & GPU support
- ✅ Windows OS build
- ❌ MacOS & Linux builds
- ❌ Build assistants with access to tools
- ❌ Orchestrate multiple assistants in a team
- ❌ Save chat history and share chat logs with community
- ❌ Share document embeddings with community
- ❌ Share model configs with community

## Supported Model Providers

This is a local model first project. We have future plans to support cloud inference providers as a config option.

- ✅ [Local](https://github.com/dieharders/ai-text-server)
- ❌ [OpenAI](https://openai.com/chatgpt)
- ❌ [Google Gemini](https://gemini.google.com)
- ❌ [Anthropic](https://www.anthropic.com)
- ❌ [Mistral AI](https://mistral.ai)
- ❌ [Groq](https://groq.com)

## How to Run

This will start a local development server with hot-reloading.

```bash
pnpm i
pnpm dev
```

## How to Deploy

To production:

```bash
vercel deploy --prod
```

To preview:

```bash
vercel deploy
```

<!-- ## Release versioning

### Patch

Increase the patch version by 1 (x.x.1 to x.x.2)

### Minor

Increase the minor version by 1 (x.1.x to x.2.x)

### Major

Increase the major version by 1 (1.x.x to 2.x.x) -->
