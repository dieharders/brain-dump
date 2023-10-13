import { auth } from '@/auth'
import { LoginButton } from '@/components/login-button'
import { IconUsers, IconGitHub } from '@/components/ui/icons'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const session = await auth()
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-6 py-10">
      <LoginButton name="anonymous" icon={IconUsers} text="Login as Anonymous" />
      <LoginButton name="github" icon={IconGitHub} />
      <LoginButton name="google" text="Login with Google" />
    </div>
  )
}
