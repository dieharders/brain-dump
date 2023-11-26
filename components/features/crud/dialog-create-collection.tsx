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
  action: T_GenericAPIRequest<T_GenericDataRes>
}

export const DialogCreateCollection = (props: IProps) => {
  const { dialogOpen, setDialogOpen, action } = props
  const [disableForm, setDisableForm] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [descrValue, setDescrValue] = useState('')
  const [tagsValue, setTagsValue] = useState('')

  // Send form to backend
  const onSubmit = useCallback(async () => {
    try {
      // Send form input as url query params
      const formInputs = { collectionName: nameValue, description: descrValue, tags: tagsValue }
      // Send request
      const result = await action({ queryParams: formInputs })
      return result?.success
    } catch {
      return false
    }
  }, [action, descrValue, nameValue, tagsValue])

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
            name="collectionName"
            value={nameValue}
            placeholder="Collection name (3-63 lowercase chars)"
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
