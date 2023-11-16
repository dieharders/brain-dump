import { Button } from '@/components/ui/button'

export const RefreshButton = ({ action }: { action?: () => void }) => {
    return <Button className="flex-none text-center" onClick={action}>Refresh</Button>
}
