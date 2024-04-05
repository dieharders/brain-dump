# 🍺 Obrew Studio - WebUI

An Ai engineer's tool for building custom Ai agents and workflows for use in your own applications or everyday life.
Fork of Vercel's Ai chatbot [example](https://github.com/vercel-labs/ai-chatbot).

<!-- <a href="https://chat.vercel.ai/">
  <img alt="Next.js 13 and app template Router-ready AI chatbot." src="https://chat.vercel.ai/opengraph-image.png">
  <h1 align="center">Next.js AI Chatbot</h1>
</a> -->

<p align="left">
  <a href="#features-roadmap"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Providers</strong></a> ·
  <a href="#how-to-run"><strong>How to Run</strong></a> ·
  <a href="#release-versions"><strong>Release Versioning</strong></a> ·
  <!-- <a href="#env-vars"><strong>Env vars</strong></a> -->
</p>
<br/>

## Features Roadmap

- ✅ Run open source models locally for free
- ✅ Streaming chat UI
- ✅ Chat with your documents (RAG)
- ✅ Build custom bots from a mix of LLM's, software configs and prompt configs
- ❌ Build assistants that have access to tools
- ❌ Orchestrate multiple assistants together in a team
- ❌ Save chat history and share chat logs with other users
- ❌ Share document embeddings with other users

## Model Providers

This is a local model first project. We have future plans to support cloud inference providers as a config option.

- ✅ [Local](https://github.com/dieharders/ai-text-server)
- ❌ [OpenAI](https://openai.com/chatgpt)
- ❌ [Google Gemini](https://gemini.google.com)
- ❌ [Anthropic](https://www.anthropic.com)
- ❌ [Mistral AI](https://mistral.ai)
- ❌ [Groq](https://groq.com)

## How to Run

### Run locally

```bash
pnpm dev
```

### Deploy

To production:

```bash
vercel deploy --prod
```

To preview:

```bash
vercel deploy
```

## Release versions

### Prerelease

Increase the patch version by 1 (x.x.1 to x.x.2)

### Patch

Increase the patch version by 1 (x.x.1 to x.x.2)

### Minor

Increase the minor version by 1 (x.1.x to x.2.x)

### Major

Increase the major version by 1 (1.x.x to 2.x.x)

<!-- ## Env vars

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

1. Install Vercel CLI: `pnpm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull` -->
