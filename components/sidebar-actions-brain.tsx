'use client'

import { Button } from '@/components/ui/button'
import {
  IconEdit,
  IconPlus,
  IconShare,
  IconTrash,
} from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface I_Props {
  setAddDocumentDialogOpen?: (open: boolean) => void
  setExploreDialogOpen?: (open: boolean) => void
  setShareDialogOpen?: (open: boolean) => void
  setDeleteDialogOpen?: (open: boolean) => void
  setSelectedCollection: () => void
}

export const SidebarActions = (props: I_Props) => {
  const { setAddDocumentDialogOpen, setExploreDialogOpen, setShareDialogOpen, setDeleteDialogOpen, setSelectedCollection } = props

  return (
    <div className="flex justify-between space-x-1">
      {/* Add Document Button */}
      <Tooltip>
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
      <Tooltip>
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
      <Tooltip>
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
      <Tooltip>
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
