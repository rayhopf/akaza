# Akaza - Claude Development Guide

This file provides context and guidelines for AI assistants working on the Akaza project.

## Project Overview

Akaza is a web3-focused chat application built with:
- **Next.js 15** (App Router with Turbopack)
- **Claude Agent SDK** for AI chat with MCP tools
- **Wagmi v2 + RainbowKit** for wallet integration
- **SQLite + Drizzle ORM** for persistence
- **shadcn/ui + Tailwind CSS** for UI

## Code Conventions

### TypeScript
- Use strict TypeScript with proper types
- Prefer `type` over `interface` for simple types
- Export types alongside components

### Components
- Use `'use client'` directive for client components
- Prefer functional components with hooks
- Use shadcn/ui components as building blocks
- Keep components focused and composable

### File Naming
- Components: PascalCase (e.g., `ChatContainer.tsx`)
- Utilities: kebab-case (e.g., `format-price.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useChat.ts`)

### Styling
- Use Tailwind utility classes
- Use `cn()` helper for conditional classes
- Follow shadcn/ui patterns for component variants

## Project Structure

```
app/
  (chat)/          # Chat route group
  api/chat/        # Streaming endpoint
components/
  chat/            # Chat UI components
  ui/              # shadcn/ui components
  web3/            # Web3 action cards
lib/
  agent/           # Agent SDK wrapper
  db/              # Database schema
  web3/            # Wagmi config
providers/         # React context providers
```

## Key Architecture Patterns

### Agent SDK Integration

The chat uses Claude Agent SDK with streaming:

```typescript
// lib/agent/index.ts
export async function* streamChat(messages: ChatMessage[]) {
  const q = query({
    prompt,
    options: {
      mcpServers: { web3: web3Server },
      systemPrompt: WEB3_SYSTEM_PROMPT,
      includePartialMessages: true,
    }
  })

  for await (const message of q) {
    yield message
  }
}
```

### MCP Tools

Custom tools are defined using `tool()` and registered with `createSdkMcpServer()`:

```typescript
const polymarketTool = tool(
  'get_polymarket',
  'Description',
  { query: z.string() },
  async ({ query }) => {
    // Implementation
    return { content: [{ type: 'text', text: data }] }
  }
)
```

### Streaming Endpoint

The `/api/chat` endpoint:
1. Receives messages from client
2. Calls `streamChat()`
3. Yields SSE events for text/actions
4. Client receives and updates UI

### Action Cards

When tools return actionable data, render as cards:
- `SwapCard` - Token swap actions
- `TokenCard` - Token price display
- Custom cards for other tools

## Development Workflow

### Adding New MCP Tools

1. Define tool in `lib/agent/index.ts` using `tool()`
2. Add to `web3Server` tools array
3. Update system prompt if needed
4. Create action card component if actionable
5. Add case to `ActionCard` in `chat-message.tsx`

### Adding New Components

1. Create in appropriate directory
2. Use shadcn/ui as base when possible
3. Export types used by component
4. Add to parent component

### Database Changes

1. Update `lib/db/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Update types if needed

## Important Notes

### Agent SDK Usage
- Use `includePartialMessages: true` for streaming
- Handle different message types: `stream_event`, `assistant`, `result`
- Extract text from `content_block_delta` events
- Tool use appears in `tool_use` content blocks

### Wallet Integration
- Always check `isConnected` before wallet actions
- Use `ConnectButton.Custom` for custom wallet UI
- Handle chain switching with `openChainModal`

### Error Handling
- Wrap streaming in try-catch
- Send error events via SSE
- Display user-friendly errors in UI
- Log detailed errors to console

## Testing Approach

### Manual Testing
1. Start dev server: `pnpm dev`
2. Test basic chat flow
3. Test MCP tool calls (ask about tokens/Polymarket)
4. Test wallet connection
5. Test action cards render correctly

### Verification Checklist
- [ ] Chat input accepts messages
- [ ] Streaming responses work
- [ ] Markdown renders correctly
- [ ] MCP tools execute and return data
- [ ] Wallet connects via RainbowKit
- [ ] Action cards render with correct data
- [ ] Mobile layout works (sidebar toggle)

## Common Tasks

### Adding a New Tool
```typescript
// 1. Define tool
const newTool = tool(
  'tool_name',
  'Description for Claude',
  { param: z.string() },
  async ({ param }) => {
    const data = await fetchData(param)
    return { content: [{ type: 'text', text: JSON.stringify(data) }] }
  }
)

// 2. Add to server
const web3Server = createSdkMcpServer({
  name: 'web3-tools',
  tools: [polymarketTool, tokenPriceTool, newTool], // Add here
})
```

### Creating an Action Card
```typescript
// 1. Create component in components/web3/
export type MyActionData = {
  // Define shape
}

export function MyActionCard({ data }: { data: MyActionData }) {
  return <Card>...</Card>
}

// 2. Add to chat-message.tsx
case 'myaction':
  return <MyActionCard data={action.data as MyActionData} />
```

## Future Enhancements

See [TODO.md](./TODO.md) for current tasks and [PLAN.md](./PLAN.md) for overall roadmap.

### Phase 2 Priorities
1. **web3-skills plugin** - Clone and integrate for Dune Analytics
2. **Conversation persistence** - Save/load chat history from DB
3. **Swap execution** - Implement actual DEX integration
4. **More tools** - News, DeFi protocols, NFT data

### Known Limitations
- Conversations not persisted yet (in-memory only)
- Swap cards don't execute actual swaps
- No user authentication (SIWE coming)
- Tool responses not cached

## Resources

- [Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Wagmi Docs](https://wagmi.sh/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

## Questions?

If you need clarification on any pattern or convention, check:
1. This file for project-specific context
2. README.md for setup and usage
3. Existing code for implementation examples
