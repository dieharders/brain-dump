# HomeBrewAi Chat Discovery

Chat with your documents and knowledgebase. A fork of Vercel's Ai chatbot [example](https://github.com/vercel-labs/ai-chatbot).

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

- Chat with your documents or knowledgebase
- Streaming chat UI
- Support for Local (default), OpenAi, Anthropic, Hugging Face, plus LangChain support
- Chat history, share chat logs with other users

## Model Providers

- [Local](https://github.com/dieharders/ai-text-server)
- [OpenAI](https://openai.com/chatgpt)
- [Anthropic](https://anthropic.com)
- [Hugging Face](https://huggingface.co)
- [LangChain](https://js.langchain.com)

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

## Creating a KV Database Instance (for chat history, session)

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Env vars

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

1. Install Vercel CLI: `pnpm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`
