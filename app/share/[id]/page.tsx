// import { type Metadata } from 'next'
// import { notFound } from 'next/navigation'

// import { formatDate } from '@/lib/utils'
// import { getSharedChat } from '@/app/actions'
// import { ChatList } from '@/components/chat-list'
// import { FooterText } from '@/components/footer'

// export const runtime = 'edge'
// export const preferredRegion = 'home'

// interface SharePageProps {
//   params: {
//     id: string
//   }
// }

// export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
//   // 非同期でgetSharedChat関数を呼び出し、特定のチャット情報を取得
//   const chat = await getSharedChat(params.id)

//   return {
//     // chat?.title から最初の50文字を抽出し、title プロパティに設定
//     title: chat?.title.slice(0, 50) ?? 'Chat'
//   }
// }

// // 非同期関数 SharePage の宣言
// export default async function SharePage({ params }: SharePageProps) {
//   // 非同期でgetSharedChat関数を呼び出し、特定のチャット情報を取得
//   const chat = await getSharedChat(params.id)

//   // chat自体もしくはsharePathが存在しない場合、notFound 関数を使用して404ページへ移動
//   if (!chat || !chat?.sharePath) {
//     notFound()
//   }

//   return (
//     <>
//       <div className="flex-1 space-y-6">
//         <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
//           <div className="mx-auto max-w-2xl md:px-6">
//             <div className="space-y-1 md:-mx-8">
//               <h1 className="text-2xl font-bold">{chat.title}</h1>
//               <div className="text-sm text-muted-foreground">
//                 {/* 日付、メッセージの数を取得 */}
//                 {formatDate(chat.createdAt)} · {chat.messages.length} messages
//               </div>
//             </div>
//           </div>
//         </div>
//         <ChatList messages={chat.messages} />
//       </div>
//       <FooterText className="py-8" />
//     </>
//   )
// }
