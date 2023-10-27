import { auth } from '@/auth'
import { LoginButtonGoogle } from '@/components/login-button-google'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const session = await auth()

  // ユーザーが既にログインしている場合、ホームへリダイレクト
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <LoginButtonGoogle />
    </div>
  )
}
