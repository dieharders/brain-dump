import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { ModelCard } from '@/components/features/menus/home/card-model-explorer'
import { IconPlus, IconDownload } from '@/components/ui/icons'
import { T_ModelConfig } from '@/lib/homebrew'
import { notifications } from '@/lib/notifications'
import { DownloadModelMenu } from '@/components/features/menus/home/menu-download-model-files'

type T_Component = React.FC<{ className?: string, children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  data: { [key: string]: T_ModelConfig }
  onOpenDirAction: () => Promise<void>
  fetchModelInfo: (repoId: string) => Promise<any>
  installedModelsInfo: Array<{ [key: string]: any }>
  downloadModel: ({ repo_id, filename }: { repo_id: string, filename: string }) => Promise<void>
  deleteModel: ({ repoId, filename }: { repoId: string, filename: string }) => Promise<void>
  hfModelsInfo: any[]
  setHFModelsInfo: Dispatch<SetStateAction<any[]>>
}

export const ModelExplorerMenu = ({
  data,
  Header,
  Title,
  Description,
  installedModelsInfo,
  downloadModel,
  onOpenDirAction,
  fetchModelInfo,
  deleteModel,
  hfModelsInfo,
  setHFModelsInfo,
}: I_Props) => {
  const modelsList = useMemo(() => Object.values(data) || [], [data])
  const { notAvailable: notAvailableNotification } = notifications()

  // Get model info for our curated list
  const getModelInfo = useCallback((m: T_ModelConfig) => {
    const action = async () => {
      const info = await fetchModelInfo(m.repoId)

      // @TODO We may want to cache this info data along with the installed_model or model_configs data
      setHFModelsInfo((prev: any) => {
        return [info.data, ...prev]
      })
    }
    action()
  }, [fetchModelInfo, setHFModelsInfo])

  return (
    <div>
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Download Ai Models</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content Container */}
      <div className="flex flex-col items-start justify-items-stretch gap-8 overflow-hidden">
        {/* Model Management Buttons */}
        <div className="flex w-full flex-col justify-center gap-4 overflow-hidden sm:flex-row">
          <ModelCard
            title="Add New"
            id="new"
            Icon={IconPlus}
            expandable={false}
            onClick={() => {
              // @TODO Open a menu to add a custom model config
              notAvailableNotification()
            }}
          />
          <ModelCard
            title="Manage Models"
            id="openDir"
            Icon={IconDownload}
            expandable={false}
            onClick={() => {
              // Open the directory where models are saved
              onOpenDirAction()
            }}
          />
        </div>
        {/* Content Menu */}
        <div className="flex w-full flex-col justify-items-stretch gap-4 overflow-hidden">
          {modelsList?.map(i => {
            const modelInfo = hfModelsInfo?.find?.(info => info.id === i.repoId)
            const modelType = modelInfo?.config?.model_type

            return (
              <ModelCard
                key={i.repoId}
                title={i.name}
                id={i.repoId}
                description={i.description}
                downloads={modelInfo?.downloads}
                type={modelType}
                provider={modelInfo?.author}
                libraryName={modelInfo?.library_name}
                tags={modelInfo?.tags}
                // licenses={i.licenses}
                onClick={({ id, isOpen }) => {
                  if (!isOpen && !modelInfo) getModelInfo(i)
                }}
              >
                <DownloadModelMenu
                  id={i.repoId}
                  installedModelsInfo={installedModelsInfo}
                  data={data}
                  deleteModel={deleteModel}
                  downloadModel={downloadModel}
                  hfModelsInfo={hfModelsInfo}
                  modelsList={modelsList}
                />
              </ModelCard>
            )
          }
          )}
        </div>
      </div>
    </div>
  )
}
