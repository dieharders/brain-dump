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
import { ClearData } from '@/components/features/crud/dialog-clear-data'

interface I_Props {
  setAddDialogOpen?: (open: boolean) => void
  setExploreDialogOpen?: (open: boolean) => void
  setShareDialogOpen?: (open: boolean) => void
  onDeleteAction?: () => void
  copyCollectionId?: () => void
}

export const CollectionActions = (props: I_Props) => {
  const { setAddDialogOpen, setExploreDialogOpen, setShareDialogOpen, onDeleteAction, copyCollectionId } = props

  return (
    <div className="flex justify-between space-x-1">
      {/* Copy id Button */}
      {copyCollectionId && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              copyCollectionId()
            }}
          >
            <IconCopy />
            <span className="sr-only">Copy collection id to clipboard</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy id</TooltipContent>
      </Tooltip>}

      {/* Add Document Button */}
      {setAddDialogOpen && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              setAddDialogOpen && setAddDialogOpen(true)
            }}
          >
            <IconPlus />
            <span className="sr-only">Add new</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add</TooltipContent>
      </Tooltip>}

      {/* Edit Button */}
      {setExploreDialogOpen && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              setExploreDialogOpen(true)
            }}
          >
            <IconEdit />
            <span className="sr-only">Edit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>}

      {/* Share Button */}
      {setShareDialogOpen && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              setShareDialogOpen(true)
            }}
          >
            <IconShare />
            <span className="sr-only">Share</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>}

      {/* Delete Button */}
      {onDeleteAction && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <ClearData
            // variant="destructive"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            action={async () => {
              onDeleteAction()
              return true
            }}
            Icon={IconTrash}
          />
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>}
    </div>
  )
}
