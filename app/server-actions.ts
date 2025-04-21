'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

// Chats

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true,
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized',
    }
  }

  const uid = await kv.hget<string>(`chat:${id}`, 'userId')

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized',
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== chat.userId) {
    return {
      error: 'Unauthorized',
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`,
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function newChat() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
    }
  }

  revalidatePath('/')
  return redirect('/')
}

export const getLatestRelease = async (githubToken: string) => {
  if (!githubToken) {
    return {
      error: 'GitHub token is required',
    }
  }

  try {
    const response = await fetch(
      'https://api.github.com/repos/dieharders/obrew-studio-server/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        // Add Next.js fetch cache options
        next: {
          revalidate: 86400, // Cache for 1 day
          tags: ['github-release'],
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      data: {
        name: data.name,
        tag_name: data.tag_name,
        published_at: data.published_at,
        relNotes: data.body,
        downloadName: data.assets[0].name,
        downloadSize: data.assets[0].size,
        downloadUrl: data.assets[0].browser_download_url,
        pageUrl: data.assets[0].url,
      },
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch latest release',
    }
  }
}
