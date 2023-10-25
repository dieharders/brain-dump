'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface IProps {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

export const DialogCreateBrain = (props: IProps) => {
  const { dialogOpen, setDialogOpen } = props
  const [titleValue, setTitleValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')
  // @TODO Get the server IP from the currently connected host from window.homebrewai.host.ip
  const endpoint = '/v1/embeddings/pre-process' // @TODO v1/embeddings/memorize ? an endpoint that does multiple steps?
  const uploadUrl = `http://localhost:8008${endpoint}`
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const onSubmit = () => {
    // Send form to backend
    const onAction = async () => {
      const form = { title: titleValue, description: descrValue, tags: tagsValue, file: selectedFile }
      const response = await fetch(uploadUrl, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (result.success) setDialogOpen(false)
      else {
        // Something went wrong
        toast.error(`File upload failed: ${result.error}`)
      }
    }
    onAction()
  }
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target?.files) return
    const files = Array.from(e.target.files)
    setSelectedFile(files[0])
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed a file into memory</DialogTitle>
          <DialogDescription>
            Select a file you want the LLM to memorize. Giving it a short description and tags help the LLM understand and recall it faster.
          </DialogDescription>
        </DialogHeader>
        {/* File Upload */}
        <DialogTitle className="text-sm">Add text, image, audio or video</DialogTitle>
        <form className="grid w-full gap-4" method="POST" encType="multipart/form-data">
          {/* File picker */}
          <input type="file" name="upload" onChange={handleFileSelected} />
          {/* Title */}
          <Input
            value={titleValue}
            placeholder="Title"
            onChange={e => setTitleValue(e.target.value)}
          />
          {/* Description */}
          <Input
            value={descrValue}
            placeholder="Description (optional, 100 chars)"
            onChange={e => setDescrValue(e.target.value)}
          />
          {/* Tags */}
          <Input
            value={tagsValue}
            placeholder="Tags (optional, 10 max)"
            onChange={e => setTagsValue(e.target.value)}
          />
        </form>
        <DialogFooter className="items-center">
          <Button
            variant="ghost"
            onClick={() => {
              setDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>)
}
