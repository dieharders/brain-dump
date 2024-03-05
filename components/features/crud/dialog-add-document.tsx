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
import { T_GenericDataRes, T_GenericAPIRequest, I_Collection, T_APIConfigOptions } from '@/lib/homebrew'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select'

type T_Payload = { [key: string]: any } | FormData

interface I_Props {
  collection: I_Collection | null,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  action: T_GenericAPIRequest<T_Payload, T_GenericDataRes>
  options?: T_APIConfigOptions
}

// A menu to upload files and add metadata for a new document
export const DialogAddDocument = (props: I_Props) => {
  const fieldContainer = "grid gap-4 rounded-md border p-4"
  const tabContainerStyle = "grid w-full gap-4 overflow-hidden"
  const { action, collection, dialogOpen, setDialogOpen, options } = props
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlValue, setUrlValue] = useState('')
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
    return (<SelectItem key={strat} value={strat}>{name}</SelectItem>)
  })

  // Store ref to our selected file
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target?.files) return
    const files = Array.from(e.target.files)
    // Only send one file
    const file = files?.[0]
    file && setSelectedFile(file)
  }

  // File source fields
  const fileMenu = (
    <div className={tabContainerStyle}>
      {/* File upload from network */}
      <div className={fieldContainer}>
        <label htmlFor="url"><DialogTitle className="text-sm">Enter a URL</DialogTitle></label>
        <Input
          name="url"
          value={urlValue}
          placeholder="https://example.com/file.txt"
          onChange={e => setUrlValue(e.target.value)}
        />
      </div>

      {/* File upload from disk */}
      <div className={fieldContainer}>
        <label htmlFor="file"><DialogTitle className="text-sm">Select a file from local storage</DialogTitle></label>
        <input disabled={urlValue.length > 0} type="file" name="file" onChange={handleFileSelected} />
      </div>

      {/* File upload from text input */}
      <div className={fieldContainer}>
        <label htmlFor="rawText"><DialogTitle className="text-sm">Copy/Paste raw text here</DialogTitle></label>
        <textarea
          name="rawText"
          disabled={false}
          className="scrollbar h-64 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
          value={rawTextValue}
          placeholder={`# A file heading\nSome text here describing stuff...\n\n## Another heading level 2\nA paragraph explaining things in more detail\n\n### Yet another heading\nMore details here...`}
          onChange={e => setRawTextValue(e.target.value)}
        />
      </div>
    </div>
  )

  // Metadata fields
  const metadataMenu = (
    <div className="grid w-full gap-4 overflow-hidden rounded-md border p-4">
      <DialogTitle className="text-sm">Enter metadata to describe file</DialogTitle>
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
          defaultValue={undefined}
          value={chunkingStrategy}
          onValueChange={setChunkingStrategy}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select Chunking Strategy"></SelectValue>
          </SelectTrigger>
          <SelectGroup>
            <SelectContent className="p-1">
              <SelectLabel className="select-none uppercase text-indigo-500">Chunking Strategy</SelectLabel>
              {chunkingStrategies}
            </SelectContent>
          </SelectGroup>
        </Select>
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
      // Send form input values (everything except file) as url query params
      const parsedTags = tagsValue // @TODO Parse the value to be a space-seperated string of words. Remove any special chars, commas.
      const formInputs = {
        collectionName: collection?.name,
        documentName: nameValue,
        urlPath: urlValue || rawTextValue, // @TODO Use a toggle to determine which input to take file value from
        description: descrValue,
        tags: parsedTags,
        ...(chunkSize && { chunkSize: parseInt(chunkSize as string) }),
        ...(chunkOverlap && { chunkOverlap: parseInt(chunkOverlap as string) }),
        chunkingStrategy,
      }
      // Create a form with our selected file attached
      const formData = new FormData()
      if (selectedFile) formData.append('file', selectedFile, selectedFile.name)
      // Send request (Add new document)
      const result = await action({
        queryParams: formInputs,
        ...(!urlValue && !rawTextValue && { formData }), // @TODO Use a toggle to determine which input to take file value from
      })
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
        setSelectedFile(null)
        setUrlValue('')
        setRawTextValue('')
        setNameValue('')
      }
    }
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed a file into memory</DialogTitle>
          <DialogDescription>
            Provide a file you want the AI to memorize (text, image, audio, video). Give it a short description and tags to help the Ai understand it better.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full" method="POST" encType="multipart/form-data">
          <Tabs label="Application Modes" tabs={tabs} />
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
