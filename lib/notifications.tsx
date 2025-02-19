import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const notifications = () => {
  const dismissStyle = cn('self-center rounded-md border p-4')

  const notAvailable = () =>
    toast('Pardon our dust.\nThis feature is not yet available.', { icon: '🧹💨' })

  const loadModel = async (promise: Promise<any>, cancel?: () => void) =>
    toast.promise(promise, {
      loading:
        <div className={cn('flex flex-col flex-wrap items-center justify-center gap-4 overflow-hidden')}>
          <div className="flex flex-col gap-1 pr-2">
            <b>Loading model 🤖</b>
            <p>Please wait...</p>
          </div>
          <Button
            variant="default"
            className={dismissStyle}
            onClick={() => {
              cancel?.()
              toast.dismiss('loading-model')
            }}>Cancel</Button>
        </div>,
      success: (res: any) =>
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="flex flex-col gap-1">
            <b className="pr-2">Model loaded!</b>
            <br />{res?.message} flex flex-col items-center justify-center gap-4
          </span>
          <Button
            variant="default"
            className={dismissStyle}
            onClick={() => {
              toast.dismiss('loading-model')
            }}>Dismiss</Button>
        </div>,
      error: (err: any) => (
        <div className="flex flex-col gap-4">
          <p>
            <b>Could not load model.</b>
            <br></br>
            <span className="overflow-hidden">{err?.message}</span>
          </p>
          <Button
            variant="default"
            className={dismissStyle}
            onClick={() => {
              navigator.clipboard.writeText(`${err?.message}`)
            }}>Copy</Button>
        </div>
      )
    },
      {
        id: 'loading-model',
      })

  return {
    notAvailable,
    loadModel,
  }
}
