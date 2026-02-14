import { streamChat, type ChatMessage } from '@/lib/agent'

export const runtime = 'nodejs'
export const maxDuration = 60

type SSEData = { type: string; content?: string; data?: unknown }

const encoder = new TextEncoder()

function encodeSSE(data: SSEData): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

function encodeSSEDone(): Uint8Array {
  return encoder.encode('data: [DONE]\n\n')
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const

export async function POST(request: Request): Promise<Response> {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages', { status: 400 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of streamChat(messages)) {
            if (message.type === 'stream_event') {
              const event = message.event
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(encodeSSE({ type: 'text', content: event.delta.text }))
              }
            } else if (message.type === 'assistant') {
              for (const block of message.message.content) {
                if (block.type === 'tool_use') {
                  controller.enqueue(
                    encodeSSE({
                      type: 'action',
                      data: { type: block.name, input: block.input },
                    })
                  )
                }
              }
            } else if (message.type === 'result') {
              console.log('Query completed:', message.subtype)
            }
          }

          controller.enqueue(encodeSSEDone())
        } catch (error) {
          console.error('Stream error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(encodeSSE({ type: 'error', content: `Error: ${errorMessage}` }))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: SSE_HEADERS })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
