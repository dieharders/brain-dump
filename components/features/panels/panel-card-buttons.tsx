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
  editAction?: (open: boolean) => void
  setShareDialogOpen?: (open: boolean) => void
  onDeleteAction?: () => void
  copyId?: () => void
}

/**
 * Assorted action buttons displayed when card is active.
 */
export const CardButtons = (props: I_Props) => {
  const { setAddDialogOpen, editAction, setShareDialogOpen, onDeleteAction, copyId } = props

  return (
    <div className="flex justify-between space-x-1">
      {/* Copy id Button */}
      {copyId && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              copyId()
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
      {editAction && <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={e => {
              e.stopPropagation()
              editAction(true)
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
          <Button className="w-6 h-6 p-0 m-0 bg-transparent hover:bg-transparent shadow-none">
            <ClearData
              variant="ghost"
              className="h-6 w-6 p-0 text-foreground hover:text-foreground hover:bg-background"
              action={async () => {
                onDeleteAction()
                return true
              }}
              Icon={IconTrash}
            />
            <span className="sr-only">Delete</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>}
    </div>
  )
}
