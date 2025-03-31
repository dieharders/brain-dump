'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ToggleGroup from '@/components/ui/toggle-group'
import { IconConversationType } from '@/components/ui/icons'
import { ClipboardIcon, CursorArrowIcon, AccessibilityIcon, ChatBubbleIcon, FileTextIcon } from '@radix-ui/react-icons'
import {
  DEFAULT_CONVERSATION_MODE,
  DEFAULT_ACTIVE_ROLE,
  I_Attention_State as I_State,
  T_ConversationMode,
  T_ToolResponseMode,
  T_ActiveRoles,
  DEFAULT_TOOL_RESPONSE_MODE
} from '@/lib/homebrew'
import { cn } from '@/lib/utils'

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
}

export const defaultState: I_State = { response_mode: DEFAULT_CONVERSATION_MODE, tool_response_mode: DEFAULT_TOOL_RESPONSE_MODE, active_role: DEFAULT_ACTIVE_ROLE }

export const AttentionTab = (props: I_Props) => {
  const { state, setState } = props
  const toggleGroupClass = cn('flex h-full w-full flex-col items-stretch gap-2 rounded p-2')

  return (
    <div className="px-1">
      {/* Chat conversation type */}
      <DialogHeader className="my-8">
        <DialogTitle>Prompt Mode</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Choose how you want the Ai to interact with you. Note, instruction-tuned models are not designed for chat mode.
        </DialogDescription>
      </DialogHeader>

      {/* Conversation content */}
      <ToggleGroup
        className="w-full items-stretch"
        label="Chat Mode"
        value={state?.response_mode}
        onChange={val => {
          setState(prev => ({ ...prev, response_mode: val as T_ConversationMode }))
        }}
      >
        {/* Instruction - Conversation ends with each query. */}
        <div id="instruct" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <ClipboardIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Instruct</span>
          </div>
          <p className="text-xs">Each question or instruction to your Ai will end the session.</p>
        </div>
        {/* Chat Conversation can continue indefinitely. */}
        <div id="chat" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Chat</span>
          </div>
          <p className="text-xs">Engage in a multi-turn conversational chat with your Ai.</p>
        </div>
      </ToggleGroup>

      {/* Tool Response Mode */}
      <DialogHeader className="my-8">
        <DialogTitle>Tool Response Mode</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Choose how the Ai responds with results from a tool.
        </DialogDescription>
      </DialogHeader>

      {/* Tool response content */}
      <ToggleGroup
        className="w-full items-stretch"
        label="Tool Response Mode"
        value={state?.tool_response_mode}
        onChange={val => {
          setState(prev => ({ ...prev, tool_response_mode: val as T_ToolResponseMode }))
        }}
      >
        {/* Pass results as response */}
        <div id="result" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <FileTextIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Results</span>
          </div>
          <p className="text-xs">Respond only with tool results. Ignores prompt/system templates.</p>
        </div>
        {/* Re-prompt llm for answer */}
        <div id="answer" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <ChatBubbleIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Answer</span>
          </div>
          <p className="text-xs">Respond to the original query with tool results as context.</p>
        </div>
      </ToggleGroup>

      {/* Active Role type */}
      <DialogHeader className="my-8">
        <DialogTitle>Active Role</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Choose the strategy for how Ai actions are carried out.
        </DialogDescription>
      </DialogHeader>

      {/* Active Role toggle */}
      <ToggleGroup
        className="w-full items-stretch"
        label="Active Role"
        value={state?.active_role}
        onChange={val => {
          setState(prev => ({ ...prev, active_role: val as T_ActiveRoles }))
        }}
      >
        {/* Worker */}
        <div id="worker" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <AccessibilityIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Worker</span>
          </div>
          <p className="text-xs">Workers will perform the action specified in the user prompt.</p>
        </div>
        {/* Agent */}
        <div id="agent" className={toggleGroupClass}>
          <div className="flex flex-row gap-2">
            <CursorArrowIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis text-xl">Agent</span>
          </div>
          <p className="text-xs">Agents can decide what actions to take and what tools to use.</p>
        </div>
      </ToggleGroup>
    </div>
  )
}
