'use client'

import { useState, useRef, useEffect } from 'react'
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

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

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

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text') {
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  const last = updated[lastIndex]
                  if (last.role === 'assistant') {
                    updated[lastIndex] = {
                      ...last,
                      content: last.content + parsed.content,
                    }
                  }
                  return updated
                })
              } else if (parsed.type === 'action') {
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  const last = updated[lastIndex]
                  if (last.role === 'assistant') {
                    updated[lastIndex] = {
                      ...last,
                      actions: [...(last.actions || []), parsed.data],
                    }
                  }
                  return updated
                })
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
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
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="animate-pulse">●</span>
                <span>Thinking...</span>
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
