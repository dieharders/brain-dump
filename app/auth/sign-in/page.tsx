import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoginForm } from '@/components/features/forms/form-login'
import { cn } from '@/lib/utils'

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

  const SVGBG = ({ className, ...props }: React.ComponentProps<'svg'>) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 540 960"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className={cn('h-full w-full', className)}
        {...props}
      >
        <rect x="0" y="0" width="540" height="960" fill="currentColor"></rect>
        <path d="M0 584L12.8 585.7C25.7 587.3 51.3 590.7 77 573.3C102.7 556 128.3 518 154 524.2C179.7 530.3 205.3 580.7 231.2 600.2C257 619.7 283 608.3 308.8 595.8C334.7 583.3 360.3 569.7 386 574.2C411.7 578.7 437.3 601.3 463 605C488.7 608.7 514.3 593.3 527.2 585.7L540 578L540 961L527.2 961C514.3 961 488.7 961 463 961C437.3 961 411.7 961 386 961C360.3 961 334.7 961 308.8 961C283 961 257 961 231.2 961C205.3 961 179.7 961 154 961C128.3 961 102.7 961 77 961C51.3 961 25.7 961 12.8 961L0 961Z" fill="#e97aab"></path>
        <path d="M0 690L12.8 676.3C25.7 662.7 51.3 635.3 77 624C102.7 612.7 128.3 617.3 154 635.3C179.7 653.3 205.3 684.7 231.2 692C257 699.3 283 682.7 308.8 669C334.7 655.3 360.3 644.7 386 637C411.7 629.3 437.3 624.7 463 628.5C488.7 632.3 514.3 644.7 527.2 650.8L540 657L540 961L527.2 961C514.3 961 488.7 961 463 961C437.3 961 411.7 961 386 961C360.3 961 334.7 961 308.8 961C283 961 257 961 231.2 961C205.3 961 179.7 961 154 961C128.3 961 102.7 961 77 961C51.3 961 25.7 961 12.8 961L0 961Z" fill="#e1679b"></path>
        <path d="M0 764L12.8 749.8C25.7 735.7 51.3 707.3 77 694.5C102.7 681.7 128.3 684.3 154 682.5C179.7 680.7 205.3 674.3 231.2 673.3C257 672.3 283 676.7 308.8 688.3C334.7 700 360.3 719 386 713.3C411.7 707.7 437.3 677.3 463 677.7C488.7 678 514.3 709 527.2 724.5L540 740L540 961L527.2 961C514.3 961 488.7 961 463 961C437.3 961 411.7 961 386 961C360.3 961 334.7 961 308.8 961C283 961 257 961 231.2 961C205.3 961 179.7 961 154 961C128.3 961 102.7 961 77 961C51.3 961 25.7 961 12.8 961L0 961Z" fill="#d8548a"></path>
        <path d="M0 732L12.8 739.8C25.7 747.7 51.3 763.3 77 771C102.7 778.7 128.3 778.3 154 788.5C179.7 798.7 205.3 819.3 231.2 814.3C257 809.3 283 778.7 308.8 768C334.7 757.3 360.3 766.7 386 783.7C411.7 800.7 437.3 825.3 463 837.3C488.7 849.3 514.3 848.7 527.2 848.3L540 848L540 961L527.2 961C514.3 961 488.7 961 463 961C437.3 961 411.7 961 386 961C360.3 961 334.7 961 308.8 961C283 961 257 961 231.2 961C205.3 961 179.7 961 154 961C128.3 961 102.7 961 77 961C51.3 961 25.7 961 12.8 961L0 961Z" fill="#cf3e79"></path>
        <path d="M0 869L12.8 870.8C25.7 872.7 51.3 876.3 77 870.8C102.7 865.3 128.3 850.7 154 854.5C179.7 858.3 205.3 880.7 231.2 888.2C257 895.7 283 888.3 308.8 874C334.7 859.7 360.3 838.3 386 838.7C411.7 839 437.3 861 463 869.3C488.7 877.7 514.3 872.3 527.2 869.7L540 867L540 961L527.2 961C514.3 961 488.7 961 463 961C437.3 961 411.7 961 386 961C360.3 961 334.7 961 308.8 961C283 961 257 961 231.2 961C205.3 961 179.7 961 154 961C128.3 961 102.7 961 77 961C51.3 961 25.7 961 12.8 961L0 961Z" fill="#c62368"></path>
      </svg>
    )
  }

  // Splash page
  return (
    <div className="flex flex-1 flex-row items-stretch justify-items-stretch self-stretch justify-self-stretch">
      {/* Left side */}
      <div className="relative hidden w-full items-center overflow-hidden bg-indigo-800/30 md:flex">
        {/* BG */}
        <div className="absolute left-0 top-0 h-full w-full" style={{ 'backgroundSize': '100% auto' }}>
          <SVGBG className="text-indigo-500 dark:text-indigo-800/30" />
        </div>
        {/* Blur */}
        {/* <div className="absolute left-0 top-0 h-full w-full" style={{ 'backgroundSize': '100% auto' }}>
          <div className="h-full w-full backdrop-blur-sm"></div>
        </div> */}
        {/* Words */}
        <div className="light:text-black h-100 dark:white absolute px-8 text-5xl font-extrabold lg:h-[50%]">
          <p>Give me ideas for {' '}</p>
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
