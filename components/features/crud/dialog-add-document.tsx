'use client'

import { ChangeEvent, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { I_GenericAPIRequestParams, I_GenericAPIResponse } from '@/lib/homebrew'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Brain } from '@/lib/types'

interface I_Props {
  collection: Brain | null,
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
  action: (payload: I_GenericAPIRequestParams) => Promise<I_GenericAPIResponse>
}
// A menu to upload files and add metadata for a new document
export const DialogAddDocument = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [disableForm, setDisableForm] = useState(false)

  // Store ref to our selected file
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target?.files) return
    const files = Array.from(e.target.files)
    // Only send one file
    setSelectedFile(files[0])
  }

  // Send form to backend
  const onSubmit = async () => {
    try {
      // Send form input values (everything except file) as url query params
      const parsedTags = tagsValue // @TODO Parse the value to be a space-seperated string of words. Remove any special chars, commas.
      const formInputs = { collection_name: collection?.name, name: nameValue, description: descrValue, tags: parsedTags }
      // Create a form with our selected file attached
      const formData = new FormData()
      formData.append('file', selectedFile!, selectedFile!.name)
      // Send request (Add new document)
      const result = await action({ queryParams: formInputs, formData })
      // Verify
      if (result.success) {
        toast.success(`File upload successful: ${result.message}`)
      }
      else {
        // Something went wrong
        const msg = result.message ? `File upload failed: ${result.message}` : 'Something went horribly wrong'
        throw new Error(msg)
      }
      return result.success
    } catch (err) {
      toast.error(`Error: ${err}`)
      return false
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed a file into memory</DialogTitle>
          <DialogDescription>
            Select a file you want the AI to memorize. Give it a short description and tags to help the Ai understand and recall it better.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4" method="POST" encType="multipart/form-data">
          {/* File Upload */}
          <label htmlFor="file"><DialogTitle className="text-sm">Add text, image, audio or video</DialogTitle></label>
          <input type="file" name="file" onChange={handleFileSelected} />
          {/* Document Name */}
          <Input
            name="name"
            value={nameValue}
            placeholder="Name (3-63 chars)"
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