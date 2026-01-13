'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { MessageSquare, Plus, Menu, X } from 'lucide-react'

type Conversation = {
  id: string
  title: string
}

export function ChatSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">🔥</span>
              <span>Akaza</span>
            </Link>
          </div>

          <Separator />

          {/* New Chat Button */}
          <div className="p-4">
            <Button asChild className="w-full" variant="outline">
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Link>
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-2">
              {conversations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No conversations yet
                </p>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/c/${conv.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                      pathname === `/c/${conv.id}` && 'bg-accent'
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{conv.title}</span>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer - Wallet Connect */}
          <div className="p-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {!connected ? (
                      <Button
                        onClick={openConnectModal}
                        className="w-full"
                        variant="outline"
                      >
                        Connect Wallet
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                        >
                          {chain.name}
                        </Button>
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          size="sm"
                        >
                          {account.displayName}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
