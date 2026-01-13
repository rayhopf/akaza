import { streamChat, type ChatMessage } from '@/lib/agent'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages', { status: 400 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of streamChat(messages)) {
            // Handle different message types from Agent SDK
            if (message.type === 'stream_event') {
              // Partial streaming message
              const event = message.event
              if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
              ) {
                const data = {
                  type: 'text',
                  content: event.delta.text,
                }
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                )
              }
            } else if (message.type === 'assistant') {
              // Complete assistant message - only process tool_use, not text (already streamed)
              const content = message.message.content
              for (const block of content) {
                if (block.type === 'tool_use') {
                  // Tool call - could send as action
                  const data = {
                    type: 'action',
                    data: {
                      type: block.name,
                      input: block.input,
                    },
                  }
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                  )
                }
              }
            } else if (message.type === 'result') {
              // Final result - skip text as it was already streamed
              // Just log for debugging
              console.log('Query completed:', message.subtype)
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = {
            type: 'error',
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
