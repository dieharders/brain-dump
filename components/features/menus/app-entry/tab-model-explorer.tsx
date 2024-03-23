import { useCallback, useEffect, useMemo, useState } from 'react'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus, IconDownload, IconClose } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons"
import { T_ModelConfig } from '@/lib/homebrew'
import { calcFileSize, cn } from '@/lib/utils'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  data: { [key: string]: T_ModelConfig }
  onOpenDirAction: () => Promise<void>
  fetchModelInfo: (repoId: string) => Promise<any>
  installedModelsInfo: Array<{ [key: string]: any }>
  downloadModel: ({ repo_id, filename }: { repo_id: string, filename: string }) => Promise<void>
  deleteModel: ({ repo_id, filename }: { repo_id: string, filename: string }) => Promise<void>
}

export const ModelExplorerMenu = ({
  data,
  Header,
  Title,
  Description,
  onOpenDirAction,
  fetchModelInfo,
  installedModelsInfo,
  downloadModel,
  deleteModel,
}: I_Props) => {
  const modelsList = useMemo(() => Object.values(data) || [], [data])
  const [modelsInfo, setModelsInfo] = useState<any[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [expandLeftMenu, setExpandLeftMenu] = useState(true)
  const selectedModelConfig = data[selectedModelId || '']
  const numQuants = useMemo(() => {
    const model = modelsInfo.find(i => i.id === selectedModelConfig.repoId)
    const quants = model?.siblings?.filter((s: any) => s.lfs)
    return quants?.length
  }, [modelsInfo, selectedModelConfig])
  const rightContainerWidth = selectedModelId ? 'w-full' : 'w-0'
  const rightContainerBorder = selectedModelId ? 'border border-primary/40' : ''
  const noBreakStyle = 'text-ellipsis whitespace-nowrap text-nowrap'
  const contentContainerGap = selectedModelId && expandLeftMenu ? 'gap-6' : ''
  const leftMenuIsExpanded = expandLeftMenu ? 'w-full' : 'w-0 overflow-hidden'

  const renderQuants = useCallback(() => {
    const QuantContainer = ({ fileName, name, fileSize, repo_id }: { fileName: string, name: string, fileSize: string, repo_id: string }) => {
      const [isDownloading, setIsDownloading] = useState(false)
      const installInfo = installedModelsInfo.find(i => i.id === repo_id)
      const isCached = installInfo?.savePath?.[fileName]

      return (
        <div className={cn("flex h-full flex-row justify-between gap-4 border-t border-dashed border-t-primary/50 bg-background p-4", noBreakStyle)}>
          {/* Quant name */}
          <div className="flex items-center justify-center gap-1 rounded-md border border-primary/50 bg-muted p-2 text-primary/50">
            Quantization<p className="text-primary">{name}</p>
          </div>
          {/* File name */}
          <p className="w-full items-center self-center overflow-hidden text-ellipsis whitespace-nowrap text-primary">{fileName}</p>
          <div className="flex w-fit justify-end gap-2">
            {/* File Size */}
            <div className="flex items-center rounded-md bg-accent/50 p-2 text-primary">{fileSize}GB</div>
            {!isCached ? (
              // Download Model Button
              <Button
                variant="outline"
                disabled={isDownloading}
                onClick={async () => {
                  setIsDownloading(true)
                  await downloadModel({ filename: fileName || '', repo_id })
                  setIsDownloading(false)
                  return
                }}
                className="flex h-fit flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-accent"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Download<IconDownload className="h-fit w-4" />
              </Button>
            ) : (
              // Delete Model Button
              <Button
                variant="outline"
                disabled={isDownloading}
                onClick={async () => {
                  setIsDownloading(true)
                  await deleteModel({ filename: fileName || '', repo_id })
                  setIsDownloading(false)
                  return
                }}
                className="flex h-fit flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-red-500 hover:text-red-100"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Delete<IconClose className="h-fit w-4" />
              </Button>
            )}
          </div>
        </div>
      )
    }

    const model = modelsInfo.find(i => i.id === selectedModelConfig?.repoId)
    const quants = model?.siblings?.filter((s: any) => s?.lfs)
    return quants?.map((q: any) => {
      const splitName = q?.rfilename.split('.')
      const nameLen = splitName.length - 1
      const name = splitName?.[nameLen - 1]
      const fileName = q?.rfilename
      const byteSize = parseInt(q?.lfs?.size, 10)
      const fileSize = calcFileSize(byteSize)
      const fileSizeString = fileSize.toString().slice(0, 4)
      return <QuantContainer
        key={fileName}
        fileName={fileName}
        fileSize={fileSizeString}
        name={name}
        repo_id={model?.id}
      />
    })
  }, [deleteModel, downloadModel, installedModelsInfo, modelsInfo, selectedModelConfig])

  // Get model info for our curated list
  useEffect(() => {
    modelsList?.forEach(async (m) => {
      const info = await fetchModelInfo(m.repoId)

      // @TODO We may want to cache this info data along with the installed_model or model_configs data
      setModelsInfo(prev => {
        prev.push(info.data)
        return prev
      })

      // Example response...
      /**
       * {
          "success": true,
          "message": "Returned model info",
          "data": {
            "id": "TheBloke/Llama-2-13B-chat-GGUF",
            "author": "TheBloke",
            "sha": "4458acc949de0a9914c3eab623904d4fe999050a",
            "created_at": "2023-09-04T17:20:15+00:00",
            "last_modified": "2023-09-27T12:47:12+00:00",
            "private": false,
            "gated": false,
            "disabled": false,
            "downloads": 783,
            "likes": 166,
            "library_name": "transformers",
            "tags": [
              "transformers",
              "gguf",
              "llama",
              "facebook",
              "meta",
              "pytorch",
              "llama-2",
              "text-generation",
              "en",
              "arxiv:2307.09288",
              "base_model:meta-llama/Llama-2-13b-chat-hf",
              "license:llama2",
              "has_space",
              "text-generation-inference",
              "region:us"
            ],
            "pipeline_tag": "text-generation",
            "mask_token": null,
            "card_data": {},
            "widget_data": [
              {
                "text": "My name is Julien and I like to"
              },
              {
                "text": "My name is Thomas and my main"
              },
              {
                "text": "My name is Mariama, my favorite"
              },
              {
                "text": "My name is Clara and I am"
              },
              {
                "text": "My name is Lewis and I like to"
              },
              {
                "text": "My name is Merve and my favorite"
              },
              {
                "text": "My name is Teven and I am"
              },
              {
                "text": "Once upon a time,"
              }
            ],
            "model_index": null,
            "config": {
              "model_type": "llama"
            },
            "transformers_info": {
              "auto_model": "AutoModel",
              "custom_class": null,
              "pipeline_tag": null,
              "processor": null
            },
            "siblings": [
              {
                "rfilename": ".gitattributes",
                "size": 2289,
                "blob_id": "e29aa6246e8c8bd2c53eeb3a6722eebdcd8a88b0",
                "lfs": null
              },
              {
                "rfilename": "LICENSE.txt",
                "size": 7020,
                "blob_id": "51089e27e6764fb9f72c06a0f3710699fb6c9448",
                "lfs": null
              },
              {
                "rfilename": "Notice",
                "size": 112,
                "blob_id": "d03b5b952a843c5ee4b3c64b05c474b1c4ee14df",
                "lfs": null
              },
              {
                "rfilename": "README.md",
                "size": 27534,
                "blob_id": "3814bf53f59217511631602f61cb587f8765ab00",
                "lfs": null
              },
              {
                "rfilename": "USE_POLICY.md",
                "size": 4766,
                "blob_id": "abbcc199b2d1e4feb5d7e40c0bd67e1b0ce29e97",
                "lfs": null
              },
              {
                "rfilename": "config.json",
                "size": 29,
                "blob_id": "a4ba21b7cb475b3ebf33292c8eda7067b98f92a4",
                "lfs": null
              },
              {
                "rfilename": "llama-2-13b-chat.Q2_K.gguf",
                "size": 5429348224,
                "blob_id": "936ab9928b25a8ab4d2c3bac8b35d8069013ff80",
                "lfs": {
                  "size": 5429348224,
                  "sha256": "fb69352085bf25c70bf0de94fc3dc9248609a255d7482a3fb308d102aabb066c",
                  "pointer_size": 135
                }
              },
              {
                "rfilename": "llama-2-13b-chat.Q3_K_L.gguf",
                "size": 6929559424,
                "blob_id": "fd45e8ab4e629a29ee03506ffac98dbdbdc24980",
                "lfs": {
                  "size": 6929559424,
                  "sha256": "cc468494ef443d82cc45c36787c988c0966e8c80267f9f793b37b67a06952a38",
                  "pointer_size": 135
                }
              },
            ],
            "spaces": [
              "Zenne/chatbot_for_files_langchain",
              "Mahadih534/Open-Source_LLM_ChatBot",
              "Lokesh1200/WebGPT",
              "m9e/Llama-2-13B-chat-GPTQ",
              "mohcineelharras/llama-index-docs-spaces",
              "UldisKK/TestRAGonPDFs",
              "Bobeabo/chatbot_for_files_langchain",
              "ruslanmv/Open-Source-LLM-Chatbot",
              "Kukedlc/Llama-13b",
              "SammyRao/AndalemGPTChatbots"
            ],
            "safetensors": null
          }
        }
       */
    })
  }, [fetchModelInfo, modelsList])

  return (
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content Container */}
      <div className={cn("flex flex-col items-start justify-items-stretch overflow-hidden xl:flex-row", contentContainerGap)}>
        {/* Left Content Menu */}
        <div className={cn("flex flex-col justify-items-stretch gap-4", leftMenuIsExpanded)}>
          <div className="flex flex-row gap-2">
            <ModelCard
              title="Add New"
              id="new"
              Icon={IconPlus}
              expandable={false}
              onClick={() => {
                // @TODO Open a menu to add a custom model config
                // ...
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
          {modelsList?.map(i =>
            <ModelCard
              key={i.id}
              title={i.name}
              id={i.id}
              description={i.description}
              fileSize={i.fileSize}
              licenses={i.licenses}
              provider={i.provider}
              fileName={i.fileName}
              onClick={() => {
                setSelectedModelId(i.id)
                setExpandLeftMenu(true)
              }}
            />
          )}
        </div>
        {/* Right Content Menu */}
        <div className={cn("order-first flex flex-col justify-items-stretch overflow-hidden rounded-md bg-accent xl:order-last", rightContainerWidth, rightContainerBorder)}>
          <div className={cn("flex h-fit flex-row items-stretch justify-between justify-items-start gap-4 bg-primary/30 p-4", noBreakStyle)}>
            {/* Expand/Collapse Button */}
            <Button
              className="h-fit w-fit"
              variant="secondary"
              onClick={() => { setExpandLeftMenu(prev => !prev) }}
            >
              {expandLeftMenu ? <PinLeftIcon className="h-4 w-4" /> : <PinRightIcon className="h-4 w-4" />}
            </Button>
            <div className="flex w-full flex-col justify-items-start self-center overflow-hidden text-left">
              {modelsList?.find(i => i.id === selectedModelId)?.name}
            </div>
            <Button
              className={cn("w-fit self-center", noBreakStyle)}
              variant="secondary"
              onClick={() => {
                if (selectedModelConfig?.modelUrl?.length && selectedModelConfig?.modelUrl?.length > 0) {
                  window?.open(selectedModelConfig?.modelUrl, '_blank')
                }
              }}
            >Model Card 🤗</Button>
          </div>
          <div className={cn("h-fit p-4 text-accent", noBreakStyle)}>Files Available ({numQuants})</div>
          {renderQuants()}
        </div>
      </div>
    </div>
  )
}
