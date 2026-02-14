'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type ChatInputProps = {
  onSend: (content: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps): React.JSX.Element {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [value])

  function handleSubmit(): void {
    if (value.trim() && !isLoading) {
      onSend(value)
      setValue('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about web3, tokens, Polymarket..."
        className="min-h-[44px] max-h-[200px] resize-none"
        disabled={isLoading}
      />
      <Button
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        size="icon"
        className="h-[44px] w-[44px] shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
