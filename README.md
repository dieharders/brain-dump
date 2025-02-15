# Obrew Studio - WebUI

Obrew Studio is a tool for building custom Ai agents and workflows. It is built to support rapid Ai app development at no cost.

## Introduction

<img align="right" src="assets/images/phone-poster.png" height="300" />

The goal of this project are:

1. Provide the easiest way for anyone to install and run open-source Ai locally
2. Provide "batteries included" building blocks (RAG, models, UI, server, memory, etc) for Ai Engineers
3. Support fast and cheap development on commodity hardware

<br clear="right"/>

## How It Works

<img align="left" src="assets/images/pc-poster.png" height="200" />

Obrew Studio can be used via the API or the WebUI. Both methods are used to talk to Obrew Server, which is what performs all the Ai workloads. To start using Obrew Studio, download the installer from [openbrewai.com](https://github.com/dieharders/obrew-studio-server) and install the app.

<br clear="left"/>

## Features Roadmap

- ✅ Run open source models locally for free
- ✅ Explore and download models from HuggingFace
- ✅ Build custom bots (like GPT store)
- ✅ Streaming chat UI
- ✅ Chat with your documents (RAG)
- ✅ Inspect & optimize document chunking for RAG
- ✅ Long-term memory (scrape website, file, raw text)
- ✅ Save chat history
- ✅ Build agents with access to tools
- ❌ Create and execute jobs
- ❌ Display source citations in chat
- ❌ Explore/Share model configs and tools from community

## How to Run

Install dependencies:

```bash
pnpm i
```

Start a local development server with hot-reloading:

```bash
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

## Release versioning

### Increase the major version by 1 (1.x.x to 2.x.x)

pnpm version major

### Increase the minor version by 1 (x.1.x to x.2.x)

pnpm version minor

### Increase the patch version by 1 (x.x.1 to x.x.2)

pnpm version patch

## Learn More

[OpenBrewAi](https://openbrewai.com)<br>
[Obrew Server](https://github.com/dieharders/obrew-studio-server)<br>
[Based on Vercel's chatbot](https://github.com/vercel-labs/ai-chatbot)<br>
