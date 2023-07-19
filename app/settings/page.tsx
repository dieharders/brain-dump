import { auth } from '@/auth'
import { getSettings } from '@/app/actions'
import { Settings } from '@/components/settings'

export interface SettingsPageProps {
  params: {
    id: string
  }
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const session = await auth()
  const settings = await getSettings(params.id, session.user.id)

  return <Settings settings={settings} />
}
