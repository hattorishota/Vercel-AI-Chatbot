import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'

export const runtime = 'edge'
export const preferredRegion = 'home'

export interface ChatPageProps {
  params: {
    id: string
  }
}

//　非同期関数 generateMetadata の宣言
export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  // 非同期でauth関数を呼び出し、ユーザーの認証セッション情報を取得して session 変数に格納
  const session = await auth()

  // ユーザーが存在しない場合、空のオブジェクトを返す。認証されていないユーザーに対してはメタデータを生成しない。
  if (!session?.user) {
    return {}
  }

  // getChat を呼び出して特定のチャット情報を非同期に取得
  const chat = await getChat(params.id, session.user.id)

  return {
    // chat?.title から最初の50文字を抽出し、title プロパティに設定
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

// 非同期関数 ChatPage の宣言
export default async function ChatPage({ params }: ChatPageProps) {
  // 非同期でauth関数を呼び出し、ユーザーの認証セッション情報を取得して session 変数に格納
  const session = await auth()

  // ユーザーが存在しない場合、ユーザーを認証せずにリダイレクトを使用して/sign-in?next=/chat/${params.id} へ移動。（ログインページへ移動）
  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  // getChat を呼び出して特定のチャット情報を非同期に取得
  const chat = await getChat(params.id, session.user.id)

  // チャットが存在しない場合、notFound 関数を使用して404ページへ移動
  if (!chat) {
    notFound()
  }

  // チャットのユーザーIDが認証されたユーザーのIDと一致しない場合、notFound 関数を使用して404ページへ移動
  if (chat?.userId !== session?.user?.id) {
    notFound()
  }

  // Chat コンポーネントにチャットのidとinitialMessageを渡して返す
  return <Chat id={chat.id} initialMessages={chat.messages} />
}
