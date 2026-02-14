import * as fs from 'fs'
import * as path from 'path'
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'

const WEB3_SYSTEM_PROMPT = `You are Akaza, a helpful AI assistant specialized in web3, blockchain, and cryptocurrency topics.

You can help users with:
- Understanding blockchain concepts and terminology
- Analyzing onchain data and trends using Dune Analytics (multi-chain blockchain data queries)
- Discussing prediction markets (especially Polymarket)
- Token prices and market analysis
- Memes and cultural trends in crypto
- Cross-chain swaps and DeFi protocols

You have access to:
- Dune Analytics skill for querying blockchain data with SQL across multiple chains (Ethereum, Polygon, Arbitrum, Optimism, Base, Bitcoin, etc.)
- Polymarket prediction markets data
- Token price and market data via CoinGecko

When discussing tokens, swaps, or onchain data, use the available tools and skills to get real data.
Always be helpful, accurate, and cite sources when possible.`

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>
}

function createTextResult(text: string): ToolResult {
  return { content: [{ type: 'text' as const, text }] }
}

function createErrorResult(error: unknown): ToolResult {
  return createTextResult(`Error: ${error}`)
}

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
  async ({ query: searchQuery, category }): Promise<ToolResult> => {
    try {
      const url = new URL('https://gamma-api.polymarket.com/markets')
      url.searchParams.set('_limit', '5')
      if (searchQuery) url.searchParams.set('_q', searchQuery)
      if (category) url.searchParams.set('tag', category)

      const response = await fetch(url.toString())
      if (!response.ok) {
        return createErrorResult(`Polymarket API returned ${response.status}`)
      }

      const markets = await response.json()
      const formatted = markets.slice(0, 5).map((m: Record<string, unknown>) => ({
        question: m.question,
        outcomes: m.outcomes,
        volume: m.volume,
        liquidity: m.liquidity,
        endDate: m.endDate,
      }))

      return createTextResult(JSON.stringify(formatted, null, 2))
    } catch (error) {
      return createErrorResult(error)
    }
  }
)

const tokenPriceTool = tool(
  'get_token_price',
  'Get current price and market data for a cryptocurrency token',
  {
    tokenId: z
      .string()
      .describe('Token ID from CoinGecko (e.g., "bitcoin", "ethereum", "solana")'),
  },
  async ({ tokenId }): Promise<ToolResult> => {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      const response = await fetch(url)

      if (!response.ok) {
        return createErrorResult(`CoinGecko API returned ${response.status}`)
      }

      const data = await response.json()
      return createTextResult(JSON.stringify(data, null, 2))
    } catch (error) {
      return createErrorResult(error)
    }
  }
)

const web3Server = createSdkMcpServer({
  name: 'web3-tools',
  tools: [polymarketTool, tokenPriceTool],
})

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function ensureCacheDir(): string {
  const cacheDir = path.join(process.cwd(), '.cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

function createLogger(): { log: (label: string, data: unknown) => void; close: () => void } {
  const cacheDir = ensureCacheDir()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logFile = path.join(cacheDir, `agent-sdk-${timestamp}.log`)
  const logStream = fs.createWriteStream(logFile, { flags: 'w' })

  return {
    log(label: string, data: unknown): void {
      const separator = '='.repeat(80)
      const entry = `[${new Date().toISOString()}] ${label}:\n${JSON.stringify(data, null, 2)}\n${separator}\n`
      logStream.write(entry)
      console.log(`[Agent SDK] ${label}`)
    },
    close(): void {
      logStream.end()
    },
  }
}

function buildPrompt(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
}

export async function* streamChat(messages: ChatMessage[]) {
  const logger = createLogger()

  try {
    const prompt = buildPrompt(messages)
    logger.log('Query Started', { prompt, messageCount: messages.length })

    const q = query({
      prompt,
      options: {
        mcpServers: { web3: web3Server },
        systemPrompt: WEB3_SYSTEM_PROMPT,
        includePartialMessages: true,
        settingSources: ['project', 'user'],
        allowedTools: ['Skill', 'Bash', 'Read', 'Write', 'Grep', 'Glob'],
        cwd: process.cwd(),
      },
    })

    let messageCount = 0
    for await (const message of q) {
      messageCount++
      logger.log(`Message #${messageCount} (${message.type})`, message)
      yield message
    }

    logger.log('Query Completed', { totalMessages: messageCount })
  } finally {
    logger.close()
  }
}
