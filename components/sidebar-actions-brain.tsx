'use client'

import { Button } from '@/components/ui/button'
import {
  IconEdit,
  IconPlus,
  IconShare,
  IconTrash,
  IconCopy,
} from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface I_Props {
  setAddDocumentDialogOpen?: (open: boolean) => void
  setExploreDialogOpen?: (open: boolean) => void
  setShareDialogOpen?: (open: boolean) => void
  setDeleteDialogOpen?: (open: boolean) => void
  setSelectedCollection: () => void
  copyCollectionId: () => void
}

export const CollectionActions = (props: I_Props) => {
  const { setAddDocumentDialogOpen, setExploreDialogOpen, setShareDialogOpen, setDeleteDialogOpen, setSelectedCollection, copyCollectionId } = props

  return (
    <div className="flex justify-between space-x-1">
      {/* Copy id Button */}
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={copyCollectionId}
          >
            <IconCopy />
            <span className="sr-only">Copy collection id to clipboard</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy id</TooltipContent>
      </Tooltip>

      {/* Add Document Button */}
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={() => {
              setSelectedCollection()
              setAddDocumentDialogOpen && setAddDocumentDialogOpen(true)
            }}
          >
            <IconPlus />
            <span className="sr-only">Add document</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add</TooltipContent>
      </Tooltip>

      {/* Edit Button */}
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={() => {
              setSelectedCollection()
              setExploreDialogOpen && setExploreDialogOpen(true)
            }}
          >
            <IconEdit />
            <span className="sr-only">Edit collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      {/* Share Button */}
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={() => {
              setSelectedCollection()
              setShareDialogOpen && setShareDialogOpen(true)
            }}
          >
            <IconShare />
            <span className="sr-only">Share collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>

      {/* Delete Button */}
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={() => {
              setSelectedCollection()
              setDeleteDialogOpen && setDeleteDialogOpen(true)
            }}
          >
            <IconTrash />
            <span className="sr-only">Delete collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
