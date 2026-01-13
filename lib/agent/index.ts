import {
  query,
  tool,
  createSdkMcpServer,
} from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'

// System prompt for web3-focused chat
const WEB3_SYSTEM_PROMPT = `You are Akaza, a helpful AI assistant specialized in web3, blockchain, and cryptocurrency topics.

You can help users with:
- Understanding blockchain concepts and terminology
- Analyzing onchain data and trends
- Discussing prediction markets (especially Polymarket)
- Token prices and market analysis
- Memes and cultural trends in crypto
- Cross-chain swaps and DeFi protocols

When discussing tokens or swaps, you can use the available tools to get real data.
Always be helpful, accurate, and cite sources when possible.
If asked about prices or market data, use the tools to get current information.`

// Polymarket tool for prediction market data
const polymarketTool = tool(
  'get_polymarket',
  'Fetch prediction market data from Polymarket including current odds and trading volume',
  {
    query: z.string().describe('Search query for markets (e.g., "Trump", "Bitcoin")'),
    category: z
      .enum(['politics', 'crypto', 'sports', 'entertainment', 'science'])
      .optional()
      .describe('Optional category filter'),
  },
  async ({ query: searchQuery, category }) => {
    try {
      // Polymarket Gamma API
      const url = new URL('https://gamma-api.polymarket.com/markets')
      url.searchParams.set('_limit', '5')
      if (searchQuery) url.searchParams.set('_q', searchQuery)
      if (category) url.searchParams.set('tag', category)

      const response = await fetch(url.toString())
      if (!response.ok) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching Polymarket data: ${response.status}` }],
        }
      }

      const markets = await response.json()
      const formatted = markets.slice(0, 5).map((m: Record<string, unknown>) => ({
        question: m.question,
        outcomes: m.outcomes,
        volume: m.volume,
        liquidity: m.liquidity,
        endDate: m.endDate,
      }))

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      }
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error}` }],
      }
    }
  }
)

// Token price tool
const tokenPriceTool = tool(
  'get_token_price',
  'Get current price and market data for a cryptocurrency token',
  {
    tokenId: z
      .string()
      .describe('Token ID from CoinGecko (e.g., "bitcoin", "ethereum", "solana")'),
  },
  async ({ tokenId }) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      )
      if (!response.ok) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching price data: ${response.status}` }],
        }
      }

      const data = await response.json()
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error}` }],
      }
    }
  }
)

// Create in-process MCP server
const web3Server = createSdkMcpServer({
  name: 'web3-tools',
  tools: [polymarketTool, tokenPriceTool],
})

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function* streamChat(messages: ChatMessage[]) {
  // Build prompt from messages
  const prompt = messages
    .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const q = query({
    prompt,
    options: {
      mcpServers: { web3: web3Server },
      systemPrompt: WEB3_SYSTEM_PROMPT,
      includePartialMessages: true,
    },
  })

  for await (const message of q) {
    yield message
  }
}
