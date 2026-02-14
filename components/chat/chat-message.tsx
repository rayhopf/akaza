'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { SwapCard, type SwapQuote } from '@/components/web3/swap-card'
import { TokenCard, type TokenData } from '@/components/web3/token-card'
import type { Message, ActionData } from './chat-container'

type ChatMessageProps = {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps): React.JSX.Element {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary' : 'bg-orange-500'}>
          {isUser ? 'U' : 'A'}
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

        {message.actions && message.actions.length > 0 && (
          <CollapsibleActionCards actions={message.actions} />
        )}
      </div>
    </div>
  )
}

function ActionCards({ actions }: { actions: ActionData[] }): React.JSX.Element {
  return (
    <div className="mt-3 space-y-2">
      {actions.map((action, i) => (
        <ActionCard key={i} action={action} />
      ))}
    </div>
  )
}

function CollapsibleActionCards({ actions }: { actions: ActionData[] }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  if (actions.length <= 2) {
    return <ActionCards actions={actions} />
  }

  const Icon = isOpen ? ChevronUp : ChevronDown
  const label = isOpen ? 'Hide' : 'Show'

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2 mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {actions.length} action cards
        </span>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {label} <Icon className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        {actions.map((action, i) => (
          <ActionCard key={i} action={action} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function BashActionCard({ action }: { action: ActionData }): React.JSX.Element {
  const command = (action.input as { command?: string })?.command || ''
  const output = action.output
  const isError = action.isError

  return (
    <div className="rounded-lg border bg-card text-card-foreground overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border-b">
        <span className="text-xs font-medium text-muted-foreground">$ Bash</span>
        {output !== undefined && (
          <span className={cn('ml-auto text-xs', isError ? 'text-red-500' : 'text-green-600')}>
            {isError ? 'error' : 'done'}
          </span>
        )}
        {output === undefined && (
          <span className="ml-auto text-xs text-muted-foreground animate-pulse">running...</span>
        )}
      </div>
      {command && (
        <pre className="px-3 py-2 text-xs overflow-x-auto bg-zinc-950 text-zinc-200">
          <code>{command}</code>
        </pre>
      )}
      {output !== undefined && (
        <pre className={cn(
          'px-3 py-2 text-xs overflow-x-auto max-h-60 border-t',
          isError ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300' : 'bg-muted/30'
        )}>
          <code>{output.length > 2000 ? output.slice(0, 2000) + '\n... (truncated)' : output}</code>
        </pre>
      )}
    </div>
  )
}

function ToolActionCard({ action }: { action: ActionData }): React.JSX.Element {
  const output = action.output
  const isError = action.isError

  return (
    <div className="rounded-lg border bg-card text-card-foreground overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border-b">
        <span className="text-xs font-medium text-muted-foreground">{action.type}</span>
        {output !== undefined && (
          <span className={cn('ml-auto text-xs', isError ? 'text-red-500' : 'text-green-600')}>
            {isError ? 'error' : 'done'}
          </span>
        )}
        {output === undefined && (
          <span className="ml-auto text-xs text-muted-foreground animate-pulse">running...</span>
        )}
      </div>
      {action.input && (
        <pre className="px-3 py-2 text-xs overflow-x-auto bg-muted/30 border-b">
          <code>{JSON.stringify(action.input, null, 2)}</code>
        </pre>
      )}
      {output !== undefined && (
        <pre className={cn(
          'px-3 py-2 text-xs overflow-x-auto max-h-40',
          isError ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300' : 'bg-muted/30'
        )}>
          <code>{output.length > 1000 ? output.slice(0, 1000) + '\n... (truncated)' : output}</code>
        </pre>
      )}
    </div>
  )
}

function ActionCard({ action }: { action: ActionData }): React.JSX.Element {
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
    case 'Bash':
      return <BashActionCard action={action} />
    default:
      return <ToolActionCard action={action} />
  }
}
