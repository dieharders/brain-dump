import toast from 'react-hot-toast'

export const notifications = () => {
  const dismissStyle = "rounded-md border border-accent bg-primary p-2 text-muted hover:bg-muted-foreground hover:text-primary"

  const notAvailable = () =>
    toast('Pardon our dust.\nThis feature is not yet available.', { icon: '🧹💨' })

  const loadModel = async (promise: Promise<any>, cancel?: () => void) =>
    toast.promise(promise, {
      loading: <>
        <div className="flex flex-col gap-1 pr-2">
          <b>Loading model 🤖</b>
          <p>Please wait...</p>
        </div>
        <button
          className={dismissStyle}
          onClick={() => {
            cancel?.()
            toast.dismiss('loading-model')
          }}>Cancel</button>
      </>,
      success: (data: any) =>
        <div className="flex flex-row items-center justify-center">
          <span>
            <b className="pr-2">Model loaded!</b>
            <br />{data?.message}
          </span>
          <button
            className={dismissStyle}
            onClick={() => {
              toast.dismiss('loading-model')
            }}>Dismiss</button>
        </div>,
      error: (err: any) => <b>Could not load model. {err}</b>,
    },
      {
        id: 'loading-model',
      })

  return {
    notAvailable,
    loadModel,
  }
}
