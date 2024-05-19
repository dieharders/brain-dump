import { Button } from '@/components/ui/button'

export const RefreshButton = ({ action }: { action?: () => void }) => {
    return <Button className="truncate text-center" onClick={action}>Refresh</Button>
}
