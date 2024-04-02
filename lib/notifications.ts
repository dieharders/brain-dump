import toast from 'react-hot-toast'

export const notifications = () => {
  const notAvailable = () =>
    toast('Pardon our dust.\nThis feature is not yet available.', { icon: '🧹💨' })

  return {
    notAvailable,
  }
}
