'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ToggleGroup from '@/components/ui/toggle-group'
import { IconConversationType } from '@/components/ui/icons'
import { PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'

type T_Mode = 'instruct' | 'chat' | 'sliding'

export interface I_State {
  mode: T_Mode
}

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
}

const DEFAULT_MODE = 'instruct'
export const defaultState: I_State = { mode: DEFAULT_MODE }

export const AttentionTab = (props: I_Props) => {
  const { state, setState } = props
  const toggleGroupClass = "flex flex-row gap-2 rounded p-2"

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Chat Mode</DialogTitle>
        <DialogDescription className="mb-4">
          {`Each model has a limited attention size. Choose how you want the Ai's attention to be handled when conversing.`}
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full">
        <ToggleGroup
          label="Chat Mode"
          value={state?.mode || DEFAULT_MODE}
          onChange={val => {
            setState(prev => ({ ...prev, mode: val as T_Mode }))
          }}
        >
          {/* Conversational Chat - Multiple messages can be sent until the context is filled, then the conversation ends. */}
          <div id="chat" className={toggleGroupClass}>
            <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Conversational</span>
          </div>
          {/* Instruction - Maximum context is used for each query, conversation ends with each query. */}
          <div id="instruct" className={toggleGroupClass}>
            <ClipboardIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Instruction</span>
          </div>
          {/* Sliding Attention - When context fills up, move the attention window forward after each query. Conversation can continue indefinitely. */}
          <div id="sliding" className={toggleGroupClass}>
            <PersonIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Rolling Chat</span>
          </div>
        </ToggleGroup>
      </div>
    </div>
  )
}
