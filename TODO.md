# Akaza - TODO

## Phase 1: Core Setup ✅ COMPLETED

- [x] Initialize Next.js 15 with TypeScript and pnpm
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up ESLint + Prettier
- [x] Initialize git repository
- [x] Install Drizzle ORM + better-sqlite3
- [x] Create SQLite schema (users, conversations, messages)
- [x] Create chat layout (sidebar + main area)
- [x] Build ChatInput and ChatMessage components
- [x] Install Claude Agent SDK
- [x] Set up streaming chat endpoint
- [x] Configure Wagmi v2 + RainbowKit for wallet
- [x] Create SwapCard and TokenCard components
- [x] Write comprehensive documentation (README, CLAUDE.md, PLAN.md)

## Phase 2: Enhanced Features 🚧 IN PROGRESS

### High Priority

- [ ] **Test the app end-to-end**
  - [ ] Add ANTHROPIC_API_KEY to .env.local
  - [ ] Start dev server and verify chat works
  - [ ] Test MCP tools (token prices, Polymarket)
  - [ ] Test wallet connection
  - [ ] Verify action cards render correctly

- [ ] **Integrate web3-skills plugin**
  - [ ] Clone https://github.com/rayhopf/web3-skills to plugins/
  - [ ] Configure plugin path in Agent SDK options
  - [ ] Test Dune Analytics skill
  - [ ] Add DUNE_API_KEY to .env.local

- [ ] **Conversation persistence**
  - [ ] Save messages to database on send
  - [ ] Load conversation history from DB
  - [ ] Create conversation CRUD operations
  - [ ] Update sidebar to show real conversations
  - [ ] Implement conversation resume in Agent SDK

- [ ] **Improve error handling**
  - [ ] Add toast notifications for errors
  - [ ] Better error messages in chat
  - [ ] Handle API rate limits gracefully
  - [ ] Add retry logic for failed requests

### Medium Priority

- [ ] **Swap execution implementation**
  - [ ] Research DEX aggregators (1inch, 0x, SWFT)
  - [ ] Create swap execution hook
  - [ ] Add approval flow for ERC20 tokens
  - [ ] Show transaction status in UI
  - [ ] Save swap history to database

- [ ] **More MCP tools**
  - [ ] News tool (CryptoPanic, CoinDesk API)
  - [ ] DeFi protocol data (Aave, Uniswap stats)
  - [ ] NFT data (OpenSea, Blur)
  - [ ] Gas price tracker
  - [ ] Token search and discovery

- [ ] **UI/UX improvements**
  - [ ] Add loading skeletons
  - [ ] Better mobile layout
  - [ ] Message timestamps
  - [ ] Copy message button
  - [ ] Dark mode toggle
  - [ ] Message edit/delete

### Low Priority

- [ ] **User authentication**
  - [ ] Implement SIWE (Sign-In with Ethereum)
  - [ ] User sessions with wallet
  - [ ] Associate conversations with users
  - [ ] User settings page

- [ ] **Conversation features**
  - [ ] Conversation titles (auto-generated)
  - [ ] Search conversations
  - [ ] Archive/delete conversations
  - [ ] Export conversation as markdown
  - [ ] Share conversation (public link)

## Phase 3: Advanced Features 🔮 FUTURE

- [ ] Multi-chain support in UI
- [ ] Transaction history tracking
- [ ] Price alerts and notifications
- [ ] Portfolio tracking integration
- [ ] Custom MCP tool marketplace
- [ ] Agent SDK subagents for complex queries
- [ ] Voice input/output
- [ ] Mobile app (React Native)

## Bugs & Issues

- [ ] None reported yet (new project)

## Technical Debt

- [ ] Add unit tests for components
- [ ] Add integration tests for API routes
- [ ] Add E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (PostHog, Mixpanel)
- [ ] Optimize bundle size
- [ ] Add performance monitoring

## Documentation

- [x] README.md with setup and usage
- [x] CLAUDE.md for AI assistants
- [x] PLAN.md with detailed implementation plan
- [x] TODO.md (this file)
- [ ] API documentation
- [ ] Component storybook
- [ ] Architecture decision records (ADR)

## Notes

- Remember to never commit .env.local with real API keys
- Test on different browsers (Chrome, Safari, Firefox)
- Test wallet connection on mobile
- Keep dependencies up to date
- Monitor Anthropic API usage and costs

## How to Use This File

1. Move tasks from "Phase 2" to "Phase 1" as you work on them
2. Mark tasks complete with [x] when done
3. Add new tasks as they come up
4. Move completed phases to bottom of file
5. Update priorities as needed
