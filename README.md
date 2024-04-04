# 🍺 Obrew Studio

A developer tool for building custom Ai agents for use in your applications.
A fork of Vercel's Ai chatbot [example](https://github.com/vercel-labs/ai-chatbot).

<!-- <a href="https://chat.vercel.ai/">
  <img alt="Next.js 13 and app template Router-ready AI chatbot." src="https://chat.vercel.ai/opengraph-image.png">
  <h1 align="center">Next.js AI Chatbot</h1>
</a> -->

<p align="left">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#run-locally"><strong>Run locally</strong></a> ·
  <a href="#deploy"><strong>Deploy</strong></a> ·
  <a href="#env-vars"><strong>Env vars</strong></a>
</p>
<br/>

## Features

- ✅ Run open source models locally for free
- ✅ Streaming chat UI
- ✅ Chat with your documents
- ✅ Build custom bots from a mix of LLM's, software configs and prompt configs
- ❌ Build assistants that have access to tools
- ❌ Orchestrate multiple assistants together in a team
- ❌ Save chat history and share chat logs with other users

## Model Providers

This is a local model first project. We have future plans to support cloud inference providers as a config option.

- ✅ [Local](https://github.com/dieharders/ai-text-server)
- ❌ [OpenAI](https://openai.com/chatgpt)
- ❌ [Google Gemini](https://gemini.google.com)

## Run locally

```bash
pnpm dev
```

## Deploy

To production:

```bash
vercel deploy --prod
```

To preview:

```bash
vercel deploy
```

## Create a release version

### Prerelease

Increase the patch version by 1 (x.x.1 to x.x.2)

### Patch

Increase the patch version by 1 (x.x.1 to x.x.2)

### Minor

Increase the minor version by 1 (x.1.x to x.2.x)

### Major

Increase the major version by 1 (1.x.x to 2.x.x)

## Creating a KV Database Instance (for chat history, session)

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Env vars

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

1. Install Vercel CLI: `pnpm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`
