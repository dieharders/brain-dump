'use client'

import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { I_ServiceApis } from '@/lib/homebrew'
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
  services: I_ServiceApis | null
}

export const DialogCreateCollection = (props: IProps) => {
  const { dialogOpen, setDialogOpen, services } = props
  const [disableForm, setDisableForm] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')

  // Send form to backend
  const onSubmit = useCallback(async () => {
    try {
      // Send form input as url query params
      const formInputs = { name: nameValue, description: descrValue, tags: tagsValue }
      // Send request
      const result = await services?.memory.addCollection({ queryParams: formInputs })
      // Verify
      if (result?.success) {
        toast.success(`🎉 Success: ${result.message}`)
      }
      else {
        // Something went wrong
        const errMsg = result?.message || 'Something went horribly wrong'
        throw new Error(errMsg)
      }
      return result.success
    } catch (err) {
      toast.error(`Error: ${err}`)
      return false
    }
  }, [descrValue, nameValue, services?.memory, tagsValue])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a collection of memories</DialogTitle>
          <DialogDescription>
            Adding a short description and tags helps the Ai understand better.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4" method="POST" encType="multipart/form-data">
          {/* Collection Name */}
          <Input
            name="name"
            value={nameValue}
            placeholder="Collection name (3-63 chars)"
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
