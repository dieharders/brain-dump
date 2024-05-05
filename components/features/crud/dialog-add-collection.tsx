'use client'

import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { T_GenericAPIRequest, T_GenericDataRes } from '@/lib/homebrew'
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
  action: T_GenericAPIRequest<any, T_GenericDataRes>
  onSuccess?: () => void
}

export const DialogCreateCollection = (props: IProps) => {
  const { dialogOpen, setDialogOpen, action, onSuccess } = props
  const [disableForm, setDisableForm] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')
  const [iconValue, setIconValue] = useState('')

  // Send form to backend
  const onSubmit = useCallback(async () => {
    try {
      // Send form input as url query params
      const formInputs = { collectionName: nameValue, description: descrValue, tags: tagsValue, icon: iconValue }
      // Send request
      const result = await action({ queryParams: formInputs })
      const success = result?.success
      if (success && onSuccess) onSuccess()
      return success
    } catch {
      return false
    }
  }, [action, onSuccess, descrValue, iconValue, nameValue, tagsValue])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">Create a collection of memories</DialogTitle>
          <DialogDescription>
            Adding a short description and tags helps the Ai understand better.
          </DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4" method="POST" encType="multipart/form-data">
          {/* Collection Name */}
          <Input
            name="collectionName"
            value={nameValue}
            placeholder="Collection name (3-63 lowercase chars)"
            onChange={e => setNameValue(e.target.value)}
          />
          {/* Icon */}
          <Input
            name="icon"
            value={iconValue}
            placeholder="Icon (optional, emoji only)"
            onChange={e => setIconValue(e.target.value)}
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
            disabled={disableForm}
            className="w-full"
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
