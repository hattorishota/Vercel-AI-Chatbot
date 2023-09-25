import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'

export const runtime = 'edge'

export default function IndexPage() {
  // 生成されたIDは通常ランダムで他のIDと衝突しないことが保証されており、このIDは一時的な識別子として使用できる。
  const id = nanoid()

  return <Chat id={id} />
}
