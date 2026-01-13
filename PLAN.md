# Akaza - Web3 Chat Application

A Claude-like chat app for web3 that lets users ask about onchain data, news, memes, Polymarket, and take in-chat actions (buy/swap tokens).

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Streaming SSE, fullstack, TypeScript |
| AI | Claude Agent SDK | Streaming, MCP tools, subagents, built-in tools |
| Web3 | Wagmi v2 + Viem + RainbowKit | Modern React hooks, wallet UI |
| Database | SQLite + Drizzle ORM | Simple, no setup, file-based |
| UI | shadcn/ui + Tailwind CSS | Customizable, accessible |
| Package Manager | pnpm | Fast, disk-efficient |

## Project Structure

```
akaza/
├── app/
│   ├── (chat)/
│   │   ├── layout.tsx          # Chat layout with sidebar
│   │   ├── page.tsx            # New chat
│   │   └── c/[id]/page.tsx     # Chat conversation
│   ├── api/
│   │   ├── chat/route.ts       # Streaming chat via Agent SDK
│   │   └── swap/route.ts       # Swap quotes
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── chat/                   # Chat components
│   │   ├── chat-container.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-message.tsx
│   │   └── chat-sidebar.tsx
│   └── web3/                   # Web3 action cards
│       ├── swap-card.tsx
│       └── token-card.tsx
├── lib/
│   ├── agent/
│   │   ├── index.ts            # Agent SDK query wrapper
│   │   ├── tools.ts            # MCP tool definitions
│   │   └── mcp-server.ts       # In-process MCP server
│   ├── db/
│   │   ├── index.ts            # Drizzle client
│   │   └── schema.ts           # SQLite schema
│   └── web3/
│       └── config.ts           # Wagmi config
├── hooks/
├── providers/
├── drizzle.config.ts
├── package.json
└── ...config files
```

## Claude Agent SDK Integration

The Agent SDK wraps Claude Code and provides streaming, tools, and plugins:

```typescript
// lib/agent/index.ts
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

// Custom MCP tools for web3 actions
const polymarketTool = tool(
  'get_polymarket',
  'Fetch prediction market data from Polymarket',
  { query: z.string() },
  async ({ query }) => {
    const data = await fetchPolymarket(query);
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  }
);

// Create in-process MCP server
const web3Server = createSdkMcpServer({
  name: 'web3-tools',
  tools: [polymarketTool, swapQuoteTool, tokenPriceTool],
});

// Stream chat responses with web3-skills plugin
export async function* streamChat(prompt: string, sessionId?: string) {
  const q = query({
    prompt,
    options: {
      mcpServers: { web3: web3Server },
      plugins: [
        { type: 'local', path: './plugins/web3-skills' }
      ],
      systemPrompt: WEB3_SYSTEM_PROMPT,
      resume: sessionId, // Continue conversation
    }
  });

  for await (const message of q) {
    yield message;
  }
}
```

## Web3 Skills Plugin (rayhopf/web3-skills)

For onchain data analysis, we'll use the web3-skills plugin which provides:
- **Dune Analytics** - SQL queries on blockchain data for custom analytics
- Pre-built queries for common web3 data (wallet activity, token flows, etc.)

Installation:
```bash
# Clone into plugins directory
git clone https://github.com/rayhopf/web3-skills plugins/web3-skills
```

The skill is invoked via `/dune` command in chat, e.g.:
- "Use /dune to analyze whale wallet activity on ETH"
- "Query Dune for top DEX volume this week"

## Implementation Plan

### Phase 1: Project Setup
1. Initialize Next.js 15 project with TypeScript (`pnpm create next-app`)
2. Configure Tailwind CSS + shadcn/ui
3. Set up ESLint + Prettier
4. Initialize git repository

### Phase 2: Database Setup
5. Install Drizzle ORM + better-sqlite3
6. Create SQLite schema (users, conversations, messages)
7. Set up Drizzle migrations
8. Add database utility functions

### Phase 3: Basic Chat UI
9. Create chat layout (sidebar + main area)
10. Build ChatInput component
11. Build ChatMessage component with markdown rendering
12. Implement chat sidebar with conversation list

### Phase 4: Agent SDK Integration
13. Install `@anthropic-ai/claude-agent-sdk`
14. Clone web3-skills plugin (`git clone https://github.com/rayhopf/web3-skills plugins/web3-skills`)
15. Create MCP tools (Polymarket, token prices, swap quotes)
16. Set up streaming endpoint (`/api/chat/route.ts`)
17. Implement useChat hook with SSE streaming
18. Connect frontend to streaming backend

### Phase 5: Wallet Integration
19. Configure Wagmi v2 + Viem + RainbowKit
20. Add Web3Provider with chains (ETH, Polygon, Arbitrum, Base)
21. Create ConnectButton in header
22. Add network switching

### Phase 6: Action Cards
23. Parse tool responses for actionable data
24. Create SwapCard component with wallet integration
25. Create TokenCard component
26. Implement swap execution flow

### Phase 7: Polish
27. Add loading states and animations
28. Error handling and toasts
29. Mobile responsive design
30. Dark/light theme toggle

## Key Files to Create

1. `app/api/chat/route.ts` - Streaming chat via Agent SDK
2. `lib/agent/index.ts` - Agent SDK wrapper with query()
3. `lib/agent/tools.ts` - MCP tool definitions (Polymarket, swap, prices)
4. `lib/agent/mcp-server.ts` - In-process MCP server
5. `lib/web3/config.ts` - Wagmi chains and connectors
6. `lib/db/schema.ts` - SQLite schema with Drizzle
7. `components/chat/chat-message.tsx` - Message with action cards
8. `components/web3/swap-card.tsx` - Swap execution card

## Dependencies

```json
{
  "@anthropic-ai/claude-agent-sdk": "latest",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "@rainbow-me/rainbowkit": "^2.0.0",
  "@tanstack/react-query": "^5.0.0",
  "drizzle-orm": "latest",
  "better-sqlite3": "latest",
  "zod": "latest",
  "react-markdown": "latest",
  "remark-gfm": "latest"
}
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=                      # Required for Agent SDK
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # For wallet connect
DUNE_API_KEY=                           # For Dune Analytics (web3-skills)
```

## Verification

1. Run `pnpm dev` and verify app loads at localhost:3000
2. Test chat input and see streaming response
3. Ask "What's happening on Polymarket?" - verify tool is called
4. Connect wallet via RainbowKit modal
5. Ask for a swap quote - verify SwapCard renders
6. Execute a test swap on testnet
