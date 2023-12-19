import { Root, List, Trigger, Content } from '@radix-ui/react-tabs'

interface I_Tab {
  label: string
  content: React.ReactNode
}

interface I_Props {
  tabs: I_Tab[]
}

export const Tabs = ({ tabs }: I_Props) => {
  return (
    <Root className="flex flex-col shadow-sm" defaultValue={tabs[0].label}>
      {/* Tabs */}
      <List className="mt-6 flex shrink-0 rounded-none" aria-label="Settings">
        {tabs.map(i => {
          return (
            <Trigger
              key={i.label}
              value={i.label}
              className="flex h-4 flex-1 cursor-default items-center justify-center border-b-2 px-4 pb-4 text-lg font-semibold uppercase text-gray-600 hover:text-white focus:border-b-2 focus:border-b-white focus:text-white"
            >
              {i.label}
            </Trigger>
          )
        })}
      </List>
      {/* Content */}
      {tabs.map(i => {
        return (
          <Content key={i.label} value={i.label}>
            {i.content}
          </Content>
        )
      })}
    </Root>
  )
}
