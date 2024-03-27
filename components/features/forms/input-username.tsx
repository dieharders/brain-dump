'use client'

import { Input } from '@/components/ui/input'

interface I_Props {
  usernameValue: string,
  setUsernameValue: (val: string) => void,
  className?: string
}

export const UserInput = (args: I_Props) => {
  const { usernameValue, setUsernameValue, className } = args

  return (
    <div className="w-full">
      <Input
        name="username"
        value={usernameValue}
        placeholder="User Name"
        onChange={e => setUsernameValue(e.target.value)}
        className={className}
      />
    </div>
  )
}
