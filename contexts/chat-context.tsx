import { Dispatch, ReactNode, SetStateAction, createContext, useState } from 'react'

interface IChatContextProps {
  promptInput: string
  setPromptInput: Dispatch<SetStateAction<string>>
}

export const ChatContext = createContext<IChatContextProps>({
  promptInput: '',
  setPromptInput: () => { },
})

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [promptInput, setPromptInput] = useState<string>('')

  return (
    <ChatContext.Provider
      value={{
        promptInput,
        setPromptInput,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
