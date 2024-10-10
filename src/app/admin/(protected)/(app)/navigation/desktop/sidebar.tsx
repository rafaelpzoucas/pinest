import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LinkType } from '@/models/nav-links'
import { PanelLeftClose } from 'lucide-react'
import { useState } from 'react'
import { Nav } from './nav'

export function DesktopNav({ links }: { links: LinkType[] }) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="p-4 hidden lg:block">
      <aside>
        <Card className="relative bg-secondary/50 z-40">
          <ScrollArea className="h-[calc(100vh_-_2rem_-_2px)]">
            <TooltipProvider>
              <div
                className={cn('flex items-center p-2', !isCollapsed && 'pl-4')}
              >
                {!isCollapsed && <h1 className="text-2xl font-bold">Pinest</h1>}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={'ghost'}
                      size={'icon'}
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="ml-auto"
                    >
                      <PanelLeftClose
                        className={cn('w-4 h-4', isCollapsed && 'rotate-180')}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isCollapsed ? (
                      <p>Minimizar menu lateral</p>
                    ) : (
                      <p>Maximizar menu lateral</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Nav isCollapsed={isCollapsed} links={links} />
            </TooltipProvider>
          </ScrollArea>
        </Card>
      </aside>
    </div>
  )
}
