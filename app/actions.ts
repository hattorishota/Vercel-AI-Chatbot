// 各ファイルで共通して使う関数を定義するファイル
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

// ユーザーに関連するチャットデータを取得するための関数
export async function getChats(userId?: string | null) {
  console.log(userId);
  
  // ユーザーが指定されていない場合は空の配列を返す
  if (!userId) {
    return []
  }

  // チャットデータを非同期で取得し、キャッシュから一括で取得するために kv.pipeline() を使用
  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
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

// 指定されたIDのチャットデータを取得するための関数
export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  // チャットデータが存在しないか、指定されたユーザーに属していない場合は null を返す
  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

// チャットを削除するための関数
export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  // ユーザーのセッションがない場合は 401 Unauthorized を返す
  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  // チャットを削除する権限がない場合は 401 Unauthorized を返す
  const uid = await kv.hget<string>(`chat:${id}`, 'userId')

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  // チャットデータを削除し、キャッシュから削除されたことを通知する
  revalidatePath('/')
  return revalidatePath(path)
}

// ユーザーの全てのチャットを削除するための関数
export async function clearChats() {
  const session = await auth()

  // ユーザーのセッションがない場合は 401 Unauthorized を返す
  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  // 削除するチャットがない場合は 404 Not Found を返す
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

// 共有されたチャットデータを取得するための関数
export async function getSharedChat(id: string) {
  // 指定されたIDのチャットデータを返す
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  // 共有されたチャットデータが存在しない場合は null を返す
  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

// チャットを共有するための関数
export async function shareChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== chat.userId) {
    return {
      error: 'Unauthorized'
    }
  }

  // チャットのオブジェクトを受け取り、共有パスを設定してデータを更新する
  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}
