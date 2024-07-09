'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import ToggleGroup from '@/components/ui/toggle-group'
import { IconConversationType } from '@/components/ui/icons'
import { ClipboardIcon } from '@radix-ui/react-icons'
import {
  AGENT_RETRIEVAL_METHOD,
  AUGMENTED_RETRIEVAL_METHOD,
  BASE_RETRIEVAL_METHOD,
  DEFAULT_CONVERSATION_MODE,
  DEFAULT_RETRIEVAL_METHOD,
  I_Attention_State as I_State,
  T_ConversationMode,
  T_RetrievalTypes
} from '@/lib/homebrew'
import { cn } from '@/lib/utils'

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
}

// @TODO Change "mode" to "conversationMode"
export const defaultState: I_State = { mode: DEFAULT_CONVERSATION_MODE, retrievalMethod: DEFAULT_RETRIEVAL_METHOD }

export const AttentionTab = (props: I_Props) => {
  const { state, setState } = props
  const toggleGroupClass = cn("flex w-full flex-row gap-2 rounded p-2")
  const selectStyle = cn("w-full flex-1")
  const selectItems = [
    {
      name: 'Base (default)',
      value: BASE_RETRIEVAL_METHOD
    },
    {
      name: 'Augmented (RAG)',
      value: AUGMENTED_RETRIEVAL_METHOD
    },
    {
      name: 'Agent (tool use)',
      value: AGENT_RETRIEVAL_METHOD
    },
  ]

  return (
    <div className="px-1">
      {/* Chat conversation type */}
      <DialogHeader className="my-8">
        <DialogTitle>Chat Context Window</DialogTitle>
        <DialogDescription className="text-md mb-4">
          {`Each model has a limited attention size. Choose how you want the Ai's attention to be handled when conversing.`}
        </DialogDescription>
      </DialogHeader>

      {/* Conversation content */}
      <ToggleGroup
        className="w-full"
        label="Chat Mode"
        value={state?.mode || DEFAULT_CONVERSATION_MODE}
        onChange={val => {
          setState(prev => ({ ...prev, mode: val as T_ConversationMode }))
        }}
      >
        {/* Conversational Chat - Multiple messages can be sent until the context is filled, then the conversation ends. */}
        {/* <div id="chat" className={toggleGroupClass}>
            <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Conversational</span>
          </div> */}
        {/* Instruction - Maximum context is used for each query, conversation ends with each query. */}
        <div id="instruct" className={toggleGroupClass}>
          <ClipboardIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
          <span className="flex-1 self-center text-ellipsis">Instruction</span>
        </div>
        {/* Sliding Attention/ Rolling Chat - When context fills up, move the attention window forward after each query. Conversation can continue indefinitely. */}
        <div id="sliding" className={toggleGroupClass}>
          <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
          <span className="flex-1 self-center text-ellipsis">Conversational</span>
        </div>
      </ToggleGroup>

      {/* Retrieval type */}
      <DialogHeader className="my-8">
        <DialogTitle>Retrieval method</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Choose a method of retrieving information whether that be using external tools (web search, etc) or private data (RAG).
        </DialogDescription>
      </DialogHeader>

      {/* Retrieval content */}
      <div className="mb-4 w-full">
        <Select
          id="retrieval_type_select"
          className={selectStyle}
          placeholder="Choose retrieval method"
          name="Retrieval methods"
          value={state.retrievalMethod}
          items={selectItems}
          onChange={val => {
            setState(prev => ({ ...prev, retrievalMethod: val as T_RetrievalTypes }))
          }}
        />
      </div>
    </div>
  )
}
