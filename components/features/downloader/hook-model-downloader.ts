export const useModelDownloader = () => {
  // Actions
  const importDownload = async (path: string) => {
    return true
  }
  const startDownload = async (resume: boolean | undefined) => {
    return true
  }
  const cancelDownload = async () => {
    return true
  }
  const deleteDownload = async () => {
    return true
  }
  const downloadProgress = () => {}
  const progressState = () => {}
  const pauseDownload = () => {}

  return {
    downloadProgress,
    progressState,
    importDownload,
    startDownload,
    pauseDownload,
    cancelDownload,
    deleteDownload,
  }
}
