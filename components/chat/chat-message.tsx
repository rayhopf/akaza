'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Message, ActionData } from './chat-container'
import { SwapCard, type SwapQuote } from '@/components/web3/swap-card'
import { TokenCard, type TokenData } from '@/components/web3/token-card'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(isUser ? 'bg-primary' : 'bg-orange-500')}>
          {isUser ? 'U' : '🔥'}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 space-y-2', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block rounded-lg px-4 py-2',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action cards */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.actions.map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionCard({ action }: { action: ActionData }) {
  switch (action.type) {
    case 'swap':
      return <SwapCard quote={action.data as SwapQuote} />
    case 'buy':
      return <TokenCard token={action.data as TokenData} />
    case 'polymarket':
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm font-medium mb-2">Polymarket</p>
          <pre className="text-xs text-muted-foreground overflow-auto">
            {JSON.stringify(action.data, null, 2)}
          </pre>
        </div>
      )
    default:
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">
            Action: {action.type}
          </p>
        </div>
      )
  }
}
