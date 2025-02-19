import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoginForm } from '@/components/features/forms/form-login'
import { MatrixWaterfall } from '@/components/features/backgrounds/matrix-waterfall'

export default async function SignInPage({
  // params,
  searchParams,
}: {
  // params: any,
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

  // "Login" screen
  if (searchParams?.login || searchParams?.create) return <LoginForm onSuccess={onSuccess} />

  // "Create account" screen
  // @TODO Add buttons to create account
  // if (searchParams?.create) {
  //   return (
  //     <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-6 py-10">
  //       <div className="text-xl font-bold">Create an account</div>
  //       <LoginButton name={ANON} icon={IconUsers} text="Login as Anonymous" onSuccess={onSuccess} />
  //       <LoginButton name="github" icon={IconGitHub} onSuccess={onSuccess} />
  //       <LoginButton name="google" text="Login with Google" onSuccess={onSuccess} />
  //     </div>
  //   )
  // }

  // Splash page
  return (
    <div className="flex flex-1 flex-row items-stretch justify-items-stretch self-stretch justify-self-stretch">
      {/* BG */}
      <div className="absolute left-0 top-0 h-full w-full" style={{ 'backgroundSize': '100% auto' }}>
        <MatrixWaterfall fontSize={20} padding={25} className="h-screen" />
        {/* Blur */}
        <div className="left-0 top-0 h-full w-full backdrop-blur-sm"></div>
      </div>
      {/* Login */}
      <div className="light:bg-primary absolute left-0 top-0 flex h-full w-full flex-col items-stretch justify-center gap-16 overflow-hidden">
        <div className="h-fit text-center text-3xl font-bold text-primary">Get started</div>
        <div className="flex h-fit w-full flex-col items-center justify-center justify-items-stretch gap-6 px-8 py-4 lg:flex-row">
          <Button className="light:hover:bg-accent h-fit w-full max-w-[32rem] whitespace-nowrap bg-white py-4 text-primary dark:bg-black dark:hover:bg-indigo-700" variant="outline" asChild>
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
