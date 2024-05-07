'use client'

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
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
import { Highlight, Info } from '@/components/ui/info'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { T_DocPayload } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'

type T_SourceFile = 'urlFile' | 'clientFile' | 'inputText' | 'serverFilePath'

interface I_InputArgs {
  items: Array<any>
  disabled: boolean
  value: string
  setValue: Dispatch<SetStateAction<string>>
  parsingMethod: string | undefined
  setParsingMethod: Dispatch<SetStateAction<string | undefined>>
  className: string
}

interface I_ClientFileArgs extends I_InputArgs {
  setValue: Dispatch<SetStateAction<any>>
  value: any
}

// Styles
const inputFieldsContainerStyle = cn("flex w-full flex-col gap-3 text-sm")
const infoContainerStyle = cn("flex w-full flex-row items-stretch justify-center gap-1")
const selectStyle = cn("w-4 flex-1")

const FileParserInfo = () => {
  return (
    <div className="flex flex-row gap-2">
      <Info label="file_parser_info" className="h-full w-8 p-1">
        <span><Highlight>Default</Highlight> uses a basic method for each file.<br /><a href="https://cloud.llamaindex.ai/parse" className="underline"><Highlight>Llama-Parse</Highlight></a> is a third-party service only available for pdf files. Do not send sensitive data.</span>
      </Info>
    </div>
  )
}

const UrlParserInfo = () => {
  return (
    <div className="flex flex-row gap-2">
      <Info label="url_parser_info" className="h-full w-8 p-1">
        <span><Highlight>Default</Highlight> uses a basic method that reads files and websites.<br />The <Highlight>Reader API</Highlight> is a third-party service that provides enhanced results (for websites only).</span>
      </Info>
    </div>
  )
}

// Input Field - File upload from network
const RenderUrlFileInput = ({ items, disabled, value, setValue, parsingMethod, setParsingMethod, className }: I_InputArgs) => {
  return (
    <div className={className}>
      <label htmlFor="urlFile" className="pointer-events-none">
        <DialogTitle className="text-sm">Enter a URL</DialogTitle>
      </label>
      {!disabled &&
        <div className={inputFieldsContainerStyle}>
          <Input
            name="urlFile"
            value={value}
            className="bg-background"
            placeholder="https://example.com"
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
          />
          <div className={infoContainerStyle}>
            <Select
              id="url_parsing_select"
              className={selectStyle}
              placeholder="Choose Parsing Method"
              name="Parsing Methods"
              value={parsingMethod || undefined}
              items={items}
              onChange={setParsingMethod}
            />
            <UrlParserInfo />
          </div>
        </div>
      }
    </div>
  )
}

// Field - File upload from client disk
const RenderClientFileUpload = ({ items, disabled, value: selectedFile, setValue: handleFileSelected, parsingMethod, setParsingMethod, className }: I_ClientFileArgs) => {
  const disabledStyleOne = disabled ? 'text-primary/40' : 'text-primary/90'
  const disabledStyleTwo = disabled ? 'text-primary/20' : 'text-primary/60'
  const hoverStyle = disabled ? '' : 'hover:bg-muted'
  const filename = `File: ${selectedFile?.name}`
  const transitionStyle = 'transition-all ease-in duration-100'
  const marginStyle = selectedFile ? 'mt-4' : ''

  return (
    <div className={className}>
      <DialogTitle className="text-sm">Select a file on disk</DialogTitle>
      {!disabled &&
        <div className="flex flex-col gap-3 p-2 text-center text-sm">
          {/* File Picker */}
          <div className="rounded-lg border-2 border-dashed border-primary/40 p-2">
            <label htmlFor="clientFile" className={cn('relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-muted/50', hoverStyle, transitionStyle)}>
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
            </label>
          </div>
          {/* File Parser Selector */}
          <div className={infoContainerStyle}>
            <Select
              id="client_file_parsing_select"
              className={selectStyle}
              placeholder="Choose Parsing Method"
              name="Parsing Methods"
              value={parsingMethod || undefined}
              items={items}
              onChange={setParsingMethod}
            />
            <FileParserInfo />
          </div>
        </div>
      }
    </div>
  )
}

// Field - File upload from text input
const RenderRawTextInput = ({ items, disabled, value, setValue, parsingMethod, setParsingMethod, className }: I_InputArgs) => {
  const hoverStyle = disabled ? 'text-primary/50 border-primary/10 placeholder:text-primary/20' : 'text-primary border-primary/20'

  return (
    <div className={className}>
      <label htmlFor="inputText" className="pointer-events-none">
        <DialogTitle className="text-sm">Paste raw text</DialogTitle>
      </label>
      {!disabled &&
        <div className={inputFieldsContainerStyle}>
          <textarea
            name="inputText"
            disabled={disabled}
            className={cn('scrollbar h-64 w-full resize-none rounded border-2 bg-muted/70 p-2 outline-none focus:border-primary/50', hoverStyle)}
            value={value}
            placeholder={`# A file heading\nSome text here describing stuff...\n\n## Another heading\nA paragraph explaining things in more detail\n\n### Yet another heading\nMore details here...`}
            onChange={e => setValue(e.target.value)}
          />
          <div className={infoContainerStyle}>
            <Select
              id="raw_text_parsing_select"
              className={selectStyle}
              placeholder="Choose Parsing Method"
              name="Parsing Methods"
              value={parsingMethod || undefined}
              items={items}
              onChange={setParsingMethod}
            />
            <FileParserInfo />
          </div>
        </div>
      }
    </div>
  )
}

// Field - Input path to file on server
const RenderServerFileInput = ({ items, disabled, value, setValue, parsingMethod, setParsingMethod, className }: I_InputArgs) => {
  return (
    <div className={className}>
      <label htmlFor="serverFilePath" className="pointer-events-none">
        <DialogTitle className="text-sm">Enter a file path on server</DialogTitle>
      </label>
      {!disabled &&
        <div className={inputFieldsContainerStyle}>
          <Input
            name="serverFilePath"
            value={value}
            className="bg-background"
            placeholder="C:\\MyDocuments"
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
          />
          <div className={infoContainerStyle}>
            <Select
              id="server_file_parsing_select"
              className={selectStyle}
              placeholder="Choose Parsing Method"
              name="Parsing Methods"
              value={parsingMethod || undefined}
              items={items}
              onChange={setParsingMethod}
            />
            <FileParserInfo />
          </div>
        </div>
      }
    </div>
  )
}

interface I_Props {
  collection: I_Collection | null,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  action: T_GenericAPIRequest<T_DocPayload, T_GenericDataRes>,
  document?: I_Source,
}

/**
 * A menu to upload files and add metadata for a new document
 */
export const DialogAddDocument = (props: I_Props) => {
  const { action, collection, document, dialogOpen, setDialogOpen } = props
  const { services } = useGlobalContext()
  const options = services?.memory.configs
  // Styles
  const fieldContainer = "grid gap-4 rounded-md border px-6 py-4 hover:border-primary/50 hover:bg-accent/50"
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
  const [urlParsingMethod, setUrlParsingMethod] = useState<string | undefined>()
  const [clientFileParsingMethod, setClientFileParsingMethod] = useState<string | undefined>()
  const [rawTextParsingMethod, setRawTextParsingMethod] = useState<string | undefined>()
  const [serverFileParsingMethod, setServerFileParsingMethod] = useState<string | undefined>()

  // Parsing methods
  const urlParsingMethods = [
    { value: 'default', name: 'Default' },
    { value: 'reader_api', name: 'Reader API' },
  ]
  const urlParsingItems = [{ name: 'Parsing Methods', isLabel: true }, ...urlParsingMethods]
  const fileParsingMethods = [
    { value: 'default', name: 'Default' },
    { value: 'llama_parse', name: 'Llama-Parse' },
  ]
  const fileParsingItems = [{ name: 'Parsing Methods', isLabel: true }, ...fileParsingMethods]

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
          <RenderUrlFileInput
            className={fieldContainer}
            disabled={fileSource !== 'urlFile'}
            items={urlParsingItems}
            value={urlValue}
            setValue={setUrlValue}
            parsingMethod={urlParsingMethod}
            setParsingMethod={setUrlParsingMethod}
          />
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="clientFile" id="r2">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r2">
          <RenderClientFileUpload
            disabled={fileSource !== 'clientFile'}
            items={fileParsingItems}
            value={selectedFile}
            setValue={handleFileSelected}
            parsingMethod={clientFileParsingMethod}
            setParsingMethod={setClientFileParsingMethod}
            className={fieldContainer}
          />
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="inputText" id="r3">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r3">
          <RenderRawTextInput
            value={rawTextValue}
            setValue={setRawTextValue}
            parsingMethod={rawTextParsingMethod}
            setParsingMethod={setRawTextParsingMethod}
            items={fileParsingItems}
            disabled={fileSource !== 'inputText'}
            className={fieldContainer}
          />
        </label>
      </div>
      <div className={inputContainer}>
        <Item className={radioGroupItemStyle} value="serverFilePath" id="r4">
          <Indicator className={radioGroupIndicatorStyle} />
        </Item>
        <label className={labelStyle} htmlFor="r4">
          <RenderServerFileInput
            items={fileParsingItems}
            value={serverPathValue}
            setValue={setServerPathValue}
            parsingMethod={serverFileParsingMethod}
            setParsingMethod={setServerFileParsingMethod}
            disabled={fileSource !== 'serverFilePath'}
            className={fieldContainer}
          />
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
      let parsingMethod = {}
      switch (fileSource) {
        case 'serverFilePath':
          if (serverPathValue) filePathPayload = { filePath: serverPathValue }
          if (serverFileParsingMethod) parsingMethod = { parsingMethod: serverFileParsingMethod }
          else throw new Error('Please provide a local path.')
          break
        case 'urlFile':
          if (urlValue) urlFilePayload = { urlPath: urlValue }
          if (urlParsingMethod) parsingMethod = { parsingMethod: urlParsingMethod }
          else throw new Error('Please provide a url path.')
          break
        case 'inputText':
          if (rawTextValue) rawTextPayload = { textInput: rawTextValue }
          if (rawTextParsingMethod) parsingMethod = { parsingMethod: rawTextParsingMethod }
          else throw new Error('Please provide text.')
          break
        // Create a form with our selected file attached if one was chosen
        case 'clientFile':
          if (selectedFile) {
            const formData = new FormData()
            formData.append('file', selectedFile, selectedFile.name)
            fileUploadPayload = { formData }
          }
          if (clientFileParsingMethod) parsingMethod = { parsingMethod: clientFileParsingMethod }
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
        ...parsingMethod,
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
            className="w-full"
            variant="ghost"
            onClick={() => {
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full"
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
