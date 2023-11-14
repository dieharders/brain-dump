import { Button } from '@/components/ui/button'

export const RefreshButton = () => {
    return <Button className="flex-none text-center" onClick={() => { console.log('@@ refresh clicked') }}>Refresh</Button>
}
