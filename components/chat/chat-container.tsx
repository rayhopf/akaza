'use client'

import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: ActionData[]
}

export type ActionData = {
  type: 'swap' | 'buy' | 'polymarket'
  data: Record<string, unknown>
}

function updateLastAssistantMessage(
  setMessages: Dispatch<SetStateAction<Message[]>>,
  updater: (message: Message) => Message
): void {
  setMessages((prev) => {
    const lastIndex = prev.length - 1
    const last = prev[lastIndex]
    if (last?.role !== 'assistant') return prev
    const updated = [...prev]
    updated[lastIndex] = updater(last)
    return updated
  })
}

function createMessage(role: 'user' | 'assistant', content: string): Message {
  return { id: crypto.randomUUID(), role, content }
}

export function ChatContainer(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  async function handleSend(content: string): Promise<void> {
    if (!content.trim() || isLoading) return

    const userMessage = createMessage('user', content)
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      setMessages((prev) => [...prev, createMessage('assistant', '')])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'text') {
              updateLastAssistantMessage(setMessages, (msg) => ({
                ...msg,
                content: msg.content + parsed.content,
              }))
            } else if (parsed.type === 'action') {
              updateLastAssistantMessage(setMessages, (msg) => ({
                ...msg,
                actions: [...(msg.actions || []), parsed.data],
              }))
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', 'Sorry, something went wrong. Please try again.'),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20">
            <h1 className="mb-2 text-2xl font-semibold">Welcome to Akaza</h1>
            <p className="text-center text-muted-foreground">
              Ask me anything about web3, onchain data, Polymarket, memes...
              <br />
              I can even help you swap tokens!
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 py-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages.at(-1)?.role === 'user' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="animate-pulse">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
