import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ANON } from '@/lib/auth/providers/anonymous'
import { LoginButton } from '@/components/login-button'
import { IconUsers, IconGitHub } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

export default async function SignInPage({
  // params,
  searchParams,
}: {
  params: any,
  searchParams: any,
}) {
  const session = await auth()
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  const onSuccess = async () => {
    'use server'
    const s = await auth()
    if (s?.user) revalidatePath('/')
  }

  // Login to account screen
  if (searchParams?.login) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-6 py-10">
        <div>Welcome back</div>
        <LoginButton name={ANON} icon={IconUsers} text="Login as Anonymous" onSuccess={onSuccess} />
        <LoginButton name="github" icon={IconGitHub} onSuccess={onSuccess} />
        <LoginButton name="google" text="Login with Google" onSuccess={onSuccess} />
      </div>
    )
  }
  // Create new account screen
  if (searchParams?.create) {
    // @TODO Add buttons to create account
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-6 py-10">
        <div className="text-xl font-bold">Create an account</div>
        <LoginButton name={ANON} icon={IconUsers} text="Login as Anonymous" onSuccess={onSuccess} />
        <LoginButton name="github" icon={IconGitHub} onSuccess={onSuccess} />
        <LoginButton name="google" text="Login with Google" onSuccess={onSuccess} />
      </div>
    )
  }
  // Splash page
  return (
    <div className="flex flex-1 flex-row items-stretch justify-items-stretch self-stretch justify-self-stretch">
      {/* Left side */}
      <div className="hidden w-full items-center bg-indigo-800/30 px-8 md:flex">
        <div className="light:text-black text-5xl font-extrabold dark:text-fuchsia-400">
          Give me ideas for {' '}
          <p className="text-4xl font-normal">a fun afternoon in San Francisco...without zombies</p>
        </div>
      </div>
      {/* Right side */}
      <div className="light:bg-primary flex w-full flex-col items-stretch justify-center overflow-hidden dark:bg-black lg:basis-1/2">
        <div className="h-fit text-center text-3xl font-bold text-primary">Get started</div>
        <div className="flex h-fit w-full flex-col items-center justify-center justify-items-stretch gap-6 px-8 py-4 lg:flex-row">
          <Button className="light:hover:bg-accent h-fit w-full max-w-[32rem] whitespace-nowrap py-4 text-primary dark:hover:bg-indigo-700" variant="outline" asChild>
            <Link href="/sign-in?login=true" className="text-xl font-bold" prefetch={false}>Log in</Link>
          </Button>
          <Button className="light:hover:bg-white light:bg-background h-fit w-full max-w-[32rem] whitespace-nowrap py-4 text-primary dark:bg-indigo-700 dark:hover:bg-indigo-500" variant="secondary" asChild>
            <Link href="/sign-in?create=true" className="text-xl font-bold" prefetch={false}>Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
