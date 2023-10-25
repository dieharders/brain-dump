'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { type Brain, type Chat } from '@/lib/types'

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

// Brains
export interface IBrainDetails {
  file: File
  title: string
  description?: string
  tags?: string
}
export async function newBrain(details: IBrainDetails) {
  // @TODO Need to fix user.id then re-apply this.
  // const session = await auth()
  // if (!session?.user?.id) {
  //   return {
  //     success: false,
  //     error: 'Unauthorized',
  //   }
  // }

  // @TODO Send details to POST /pre-process endpoint
  return { success: true }
}

export async function getBrains(userId: string | undefined): Promise<Brain[]> {
  if (!userId) return []

  // @TODO Temp data. Replace with call to vercel kv database
  return [
    {
      id: '0x',
      title: 'Chemical research in reactive states of H2 and Hydrogen Sulfide',
      createdAt: new Date(),
      userId: '1',
      documents: [
        {
          id: '0',
          title: 'Developing sulfides for space travel vol. 3',
        },
        {
          id: '1',
          title: 'Getting to the Moon and beyond by Arthur Douglas McAdams Esquire',
        },
      ],
      sharePath: '',
    },
    {
      id: '1b',
      title:
        'Biological, electrical research imperative ordained by the state of California',
      createdAt: new Date(),
      userId: '1',
      documents: [
        {
          id: '0',
          title: 'Engineering imperatives vol. 1',
        },
        {
          id: '1',
          title: 'How to engineer new elements DIY style',
        },
      ],
      sharePath: '',
    },
  ]
}

export async function getBrain(_id: string, _userId: string) {
  // const brain = await kv.hgetall<Brain>(`brain:${id}`)

  // if (!brain || (userId && brain.userId !== userId)) {
  //   return null
  // }

  return { id: '0x' }
}

export async function shareBrain(brain: Brain) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== brain.userId) {
    return {
      error: 'Unauthorized',
    }
  }

  const payload = {
    ...brain,
    sharePath: `/share/${brain.id}`,
  }

  await kv.hmset(`brain:${brain.id}`, payload)

  return payload
}

export async function removeBrain({ id }: { id: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized',
    }
  }

  const uid = await kv.hget<string>(`brain:${id}`, 'userId')

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized',
    }
  }

  await kv.del(`brain:${id}`)
  await kv.zrem(`user:brain:${session.user.id}`, `brain:${id}`)

  return
}
