import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

// OpenAIのAPIキーを設定するために変数 configuration を作成し、Configuration クラスの新しいインスタンスを生成
const configuration = new Configuration({
  // OpenAIのAPIにアクセスするために、apiKey プロパティに環境変数 OPENAI_API_KEY の値を設定
  apiKey: process.env.OPENAI_API_KEY
})

// インスタンスの作成
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  // userId がない場合は、401 Unauthorized を返す
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  // previewToken がある場合は、previewToken を apiKey に設定する
  if (previewToken) {
    configuration.apiKey = previewToken
  }

  // OpenAIのAPIを呼び出す
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  // OpenAIのAPIのレスポンスをストリームとして返す
  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  // StreamingTextResponse クラスのインスタンスを生成して返す
  return new StreamingTextResponse(stream)
}
