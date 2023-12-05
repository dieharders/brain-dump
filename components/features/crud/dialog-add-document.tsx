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
import { T_GenericDataRes, T_GenericAPIRequest, I_Collection } from '@/lib/homebrew'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface I_Props {
  collection: I_Collection | null,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  action: T_GenericAPIRequest<T_GenericDataRes>
}
// A menu to upload files and add metadata for a new document
export const DialogAddDocument = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlValue, setUrlValue] = useState('')
  const [disableForm, setDisableForm] = useState(false)

  // Store ref to our selected file
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target?.files) return
    const files = Array.from(e.target.files)
    // Only send one file
    const file = files?.[0]
    file && setSelectedFile(file)
  }

  // Send form to backend
  const onSubmit = async () => {
    try {
      // Send form input values (everything except file) as url query params
      const parsedTags = tagsValue // @TODO Parse the value to be a space-seperated string of words. Remove any special chars, commas.
      const formInputs = { collectionName: collection?.name, documentName: nameValue, description: descrValue, tags: parsedTags, urlPath: urlValue }
      // Create a form with our selected file attached
      const formData = new FormData()
      if (selectedFile) formData.append('file', selectedFile, selectedFile.name)
      // Send request (Add new document)
      const result = await action({ queryParams: formInputs, ...(!urlValue && { formData }) })
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
            Provide a file you want the AI to memorize. Give it a short description and tags to help the Ai understand it better.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4" method="POST" encType="multipart/form-data">
          {/* File upload from network */}
          <label htmlFor="url"><DialogTitle className="text-sm">Add a URL to text, image, audio, video file</DialogTitle></label>
          <Input
            name="url"
            value={urlValue}
            placeholder="https://example.com/file.txt"
            onChange={e => setUrlValue(e.target.value)}
          />
          {/* File upload from disk */}
          <label htmlFor="file"><DialogTitle className="text-sm">Or select a file from local storage</DialogTitle></label>
          <input disabled={urlValue.length > 0} type="file" name="file" onChange={handleFileSelected} />
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
        </form>
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
