# 🍺 Obrew Studio - WebUI

Obrew Studio is a tool for building custom Ai agents and workflows. It is built to support rapid Ai app development at no cost.

## Introduction

The goal of this project are:

1. Provide the easiest way for anyone to install and run open-source Ai locally
2. Provide "batteries included" building blocks (RAG, models, UI, server, memory, etc) for Ai Engineers
3. Support fast and cheap development on commodity hardware

## How It Works

A simple WebUI which performs all its' functions via [Obrew Server](https://github.com/dieharders/ai-text-server). You can use it to interface with a server running locally or a hosted server.

## Features Roadmap

- ✅ Run open source models locally for free
- ✅ Explore and download models from HuggingFace
- ✅ Build custom bots (like GPT store)
- ✅ Streaming chat UI
- ✅ Chat with your documents (RAG)
- ✅ Inspect & optimize document chunking (for RAG)
- ✅ Long-term memory (scrape website, file, raw text)
- ✅ Save chat history
- ❌ Build agents with access to tools
- ❌ Create and execute jobs
- ❌ Source citations in chat
- ❌ Explore/Share model configs from community
- ❌ Use voice to speak to Ai and text-to-speech to hear responses

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

Increase the major version by 1 (1.x.x to 2.x.x)

-->

## Learn More

- [OpenBrewAi](https://openbrewai.com)
- [Obrew Server](https://github.com/dieharders/ai-text-server)
<!-- https://github.com/vercel-labs/ai-chatbot -->
