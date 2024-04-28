'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { Root, Item, Indicator } from '@radix-ui/react-radio-group'
import { T_GenericDataRes, T_GenericAPIRequest, I_Collection, I_Source } from '@/lib/homebrew'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { T_DocPayload } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'

type T_SourceFile = 'urlFile' | 'clientFile' | 'inputText' | 'serverFilePath'

interface I_Props {
  collection: I_Collection | null,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  action: T_GenericAPIRequest<T_DocPayload, T_GenericDataRes>,
  document?: I_Source,
}

// A menu to upload files and add metadata for a new document
export const DialogAddDocument = (props: I_Props) => {
  const { action, collection, document, dialogOpen, setDialogOpen } = props
  const { services } = useGlobalContext()
  const options = services?.memory.configs
  // Styles
  const fieldContainer = "grid gap-4 rounded-md border p-4 hover:border-primary/50 hover:bg-accent/50"
  const radioGroupItemStyle = "mr-4 h-7 w-8 rounded-full border border-muted bg-background hover:border-primary/50 hover:bg-accent focus:border-primary/25 focus:bg-muted/50"
  const radioGroupIndicatorStyle = "flex h-full w-full items-center justify-center text-xl after:h-[1rem] after:w-[1rem] after:rounded-full after:bg-primary/50 after:content-['']"
  const labelStyle = "w-full"
  const inputContainer = "flex flex-row items-center"
  // State
  const defaultFileSource = 'urlFile'
  const [fileSource, setFileSource] = useState<T_SourceFile>(defaultFileSource)
  const [nameValue, setNameValue] = useState(document?.name ?? '')
  const [descrValue, setDescrValue] = useState(document?.description ?? '')
  const [tagsValue, setTagsValue] = useState(document?.tags ?? '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlValue, setUrlValue] = useState('')
  const [serverPathValue, setServerPathValue] = useState('')
  const [rawTextValue, setRawTextValue] = useState('')
  const [disableForm, setDisableForm] = useState(false)
  const [chunkSize, setChunkSize] = useState<number | string>('')
  const [chunkOverlap, setChunkOverlap] = useState<number | string>('')
  const [chunkingStrategy, setChunkingStrategy] = useState<string | undefined>()
  // Load available strats from endpoint
  const strategies = options?.chunkingStrategies
  const chunkingStrategies = strategies?.map(strat => {
    const parseName = (str: string) => {
      const words = str.split('_')
      words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      return words.join(' ')
    }
    const name = parseName(strat)
    return { value: strat, name: name }
  }) || []
  const chunkingItems = [{ name: 'Chunking Methods', isLabel: true }, ...chunkingStrategies]

  // Store ref to our selected file
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target?.files) return
    const files = Array.from(e.target.files)
    // Only send one file
    const file = files?.[0]
    file && setSelectedFile(file)
  }

  // Input Field - File upload from network
  const renderUrlFileInput = ({ className }: { className: string }) => {
    const disabled = fileSource !== 'urlFile'

    return (
      <div className={className}>
        <label htmlFor="urlFile" className="pointer-events-none">
          <DialogTitle className="text-sm">Enter a URL</DialogTitle>
        </label>
        {!disabled &&
          <Input
            name="urlFile"
            value={urlValue}
            placeholder="https://example.com/file.txt"
            onChange={e => setUrlValue(e.target.value)}
            disabled={disabled}
          />}
      </div>
    )
  }

  // Field - File upload from client disk
  const renderClientFileUpload = ({ className }: { className: string }) => {
    const disabled = fileSource !== 'clientFile'
    const disabledStyleOne = disabled ? 'text-primary/40' : 'text-primary/90'
    const disabledStyleTwo = disabled ? 'text-primary/20' : 'text-primary/60'
    const hoverStyle = disabled ? '' : 'hover:bg-muted/70 hover:border-primary/40'
    const filename = `File: ${selectedFile?.name}`
    const transitionStyle = 'transition-all ease-in duration-100'
    const marginStyle = selectedFile ? 'mt-4' : ''

    return (
      <div className={className}>
        <DialogTitle className="text-sm">Select a file on disk</DialogTitle>
        {!disabled &&
          <label htmlFor="clientFile" className={cn('relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-muted/50', hoverStyle, transitionStyle)}>
            <Input
              className="z-10 block h-full w-full cursor-pointer border-0 bg-transparent text-center text-transparent file:text-transparent"
              disabled={disabled}
              type="file"
              name="clientFile"
              onChange={handleFileSelected}
            />
            <div className="absolute flex w-full flex-col items-center justify-center overflow-hidden pb-6 pt-5">
              <svg className={cn('mb-4 h-14 w-14', disabledStyleOne, transitionStyle)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className={cn('mb-2 text-sm font-semibold', disabledStyleOne, transitionStyle)}>Click to upload or drag and drop</p>
              <p className={cn('text-xs', disabledStyleTwo, transitionStyle)}>text, image, audio, video (MAX 10mb)</p>
              <p
                className={cn('text-md w-full overflow-hidden text-ellipsis whitespace-nowrap text-center font-semibold', disabledStyleOne, transitionStyle, marginStyle)}>
                {selectedFile ? filename : ''}
              </p>
            </div>
          </label>}
      </div>
    )
  }

  // Field - File upload from text input
  const renderRawTextInput = ({ className }: { className: string }) => {
    const disabled = fileSource !== 'inputText'
    const hoverStyle = disabled ? 'text-primary/50 border-primary/10 placeholder:text-primary/20' : 'text-primary border-primary/20'

    return (
      <div className={className}>
        <label htmlFor="inputText" className="pointer-events-none">
          <DialogTitle className="text-sm">Paste raw text</DialogTitle>
        </label>
        {!disabled &&
          <textarea
            name="inputText"
            disabled={disabled}
            className={cn('scrollbar h-64 w-full resize-none rounded border-2 bg-muted/70 p-2 outline-none focus:border-primary/50', hoverStyle)}
            value={rawTextValue}
            placeholder={`# A file heading\nSome text here describing stuff...\n\n## Another heading\nA paragraph explaining things in more detail\n\n### Yet another heading\nMore details here...`}
            onChange={e => setRawTextValue(e.target.value)}
          />}
      </div>
    )
  }

  // Field - Input path to file on server
  const renderServerFileInput = ({ className }: { className: string }) => {
    const disabled = fileSource !== 'serverFilePath'

    return (
      <div className={className}>
        <label htmlFor="serverFilePath" className="pointer-events-none">
          <DialogTitle className="text-sm">Enter a file path on server</DialogTitle>
        </label>
        {!disabled &&
          <Input
            name="serverFilePath"
            value={serverPathValue}
            placeholder={document?.filePath || 'C:\\MyDocuments'}
            onChange={e => setServerPathValue(e.target.value)}
            disabled={disabled}
          />}
      </div>
    )
  }

  // Tab - File source fields
  const fileMenu = (
    <Root
      className="flex w-full flex-col gap-6 overflow-hidden"
      defaultValue={fileSource}
      aria-label="Upload file source"
      onValueChange={(val: T_SourceFile) => setFileSource(val)}
    >
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="urlFile" id="r1">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r1">
          {renderUrlFileInput({ className: fieldContainer })}
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="clientFile" id="r2">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r2">
          {renderClientFileUpload({ className: fieldContainer })}
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="inputText" id="r3">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r3">
          {renderRawTextInput({ className: fieldContainer })}
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="serverFilePath" id="r4">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r4">
          {renderServerFileInput({ className: fieldContainer })}
        </label>
      </div>
    </Root>
  )

  // Tab - Metadata fields
  const metadataMenu = (
    <div className="grid w-full gap-4 overflow-hidden rounded-md border p-4">
      <DialogTitle className="text-sm">Enter metadata to describe the file</DialogTitle>
      {/* Document Name */}
      <Input
        name="name"
        value={nameValue}
        placeholder="Name (3-63 lowercase chars)"
        onChange={e => setNameValue(e.target.value)}
      />
      {/* Description */}
      <Input
        name="description"
        value={descrValue}
        placeholder="Description (optional, 100 chars)"
        onChange={e => setDescrValue(e.target.value)}
      />
      {/* Tags */}
      <Input
        name="tags"
        value={tagsValue}
        placeholder="Tags (optional, 10 max)"
        onChange={e => setTagsValue(e.target.value)}
      />
      {/* Chunk Size */}
      <Input
        name="chunkSize"
        type="number"
        value={chunkSize}
        min={1}
        step={1}
        placeholder="Chunk Size (300)"
        onChange={e => setChunkSize(e.target.value)}
      />
      {/* Chunk Overlap */}
      <Input
        name="chunkOverlap"
        type="number"
        value={chunkOverlap}
        min={0}
        step={1}
        placeholder="Chunk Overlap (0)"
        onChange={e => setChunkOverlap(e.target.value)}
      />
      {/* Chunking Strategy */}
      <div className="w-full">
        <Select
          id="chunking_select"
          placeholder="Pick Chunking Method"
          name="Chunking Method"
          value={chunkingStrategy || undefined}
          items={chunkingItems}
          onChange={setChunkingStrategy}
        />
      </div>
    </div>
  )

  const tabs = [
    { label: 'file', icon: "💾", content: fileMenu },
    { label: 'metadata', icon: "📄", content: metadataMenu },
  ]

  // Send form to backend
  const onSubmit = async () => {
    try {
      // Verify file paths
      let filePathPayload = {}
      let urlFilePayload = {}
      let rawTextPayload = {}
      let fileUploadPayload = {}
      switch (fileSource) {
        case 'serverFilePath':
          if (serverPathValue) filePathPayload = { filePath: serverPathValue }
          else throw new Error('Please provide a local path.')
          break
        case 'urlFile':
          if (urlValue) urlFilePayload = { urlPath: urlValue }
          else throw new Error('Please provide a url path.')
          break
        case 'inputText':
          if (rawTextValue) rawTextPayload = { textInput: rawTextValue }
          else throw new Error('Please provide text.')
          break
        // Create a form with our selected file attached if one was chosen
        case 'clientFile':
          if (selectedFile) {
            const formData = new FormData()
            formData.append('file', selectedFile, selectedFile.name)
            fileUploadPayload = { formData }
          }
          break
        default:
          break
      }
      // Send form input values (everything except file) as url query params
      const parsedTags = tagsValue // @TODO Parse the value to be a space-seperated string of words. Remove any special chars, commas.
      const formInputs = {
        collectionName: collection?.name,
        ...(document?.id && { documentId: document?.id }), // include only if updating doc
        documentName: nameValue,
        ...filePathPayload,
        ...urlFilePayload,
        ...rawTextPayload,
        description: descrValue,
        tags: parsedTags,
        ...(chunkSize && { chunkSize: parseInt(chunkSize as string) }),
        ...(chunkOverlap && { chunkOverlap: parseInt(chunkOverlap as string) }),
        chunkingStrategy,
      }
      // Create the payload for the endpoint
      const payload = {
        queryParams: formInputs,
        ...fileUploadPayload,
      }
      // Send request
      const result = await action(payload)
      // Verify
      if (result?.success) {
        toast.success(`File upload successful: ${result.message}`)
      }
      else {
        // Something went wrong
        const msg = result?.message ? `File upload failed: ${result?.message}` : 'Something went horribly wrong'
        throw new Error(msg)
      }
      return result.success
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

  // Reset menu inputs when menu is open/closed
  useEffect(() => {
    return () => {
      if (!dialogOpen) {
        setFileSource(defaultFileSource)
        setSelectedFile(null)
        setUrlValue('')
        setRawTextValue('')
      }
    }
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{document?.name ? `Update memory "${document?.name || '??'}"` : 'Embed a file into memory'}</DialogTitle>
          <DialogDescription>
            Provide a file you want the AI to memorize (text, image, audio, video). Give it a short description and tags to help the Ai understand it better.
          </DialogDescription>
        </DialogHeader>

        <form className="w-full" method="POST" encType="multipart/form-data">
          <Tabs label="Embed Document" tabs={tabs} />
        </form>

        <Separator className="my-4" />

        <DialogFooter className="items-center">
          <Button
            disabled={disableForm}
            variant="ghost"
            onClick={() => {
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={disableForm}
            onClick={async () => {
              setDisableForm(true)
              const success = await onSubmit()
              success && setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>)
}
