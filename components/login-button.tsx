'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { FcGoogle } from 'react-icons/fc'

interface LoginButtonProps extends ButtonProps {
  showGoogleIcon?: boolean
  text?: string
}

export function LoginButton({
  text = 'Login with Google',
  showGoogleIcon = true,
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        // 認証プロバイダ（google）、{ callbackUrl: / } は認証成功後のリダイレクト先URLを指定
        signIn('github', { callbackUrl: `http://localhost:3001/` })
      }}
      // ログインボタンをクリックした際に、isLoading を true に設定し、ボタンを無効化
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : showGoogleIcon ? (
        <FcGoogle className="mr-2" />
      ) : null}
      {text}
    </Button>
  )
}
