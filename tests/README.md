# Dune Skill Test

Test script for validating the Dune Analytics skill integration with Claude Agent SDK.

## Test: `test-dune-execution.ts`

Executes a real blockchain query and logs all Agent SDK messages to understand how Skills and Bash tools interact.

### Query
"Binance BTC flow in recent 7 days"

### Run Test

```bash
npm run test:dune
```

Or directly:

```bash
npx tsx tests/test-dune-execution.ts
```

### Output

- **Console**: Real-time execution details
- **`.cache/dune-test-output.log`**: Complete message flow with all Agent SDK messages

### What It Shows

1. Skill tool invocation
2. SKILL.md documentation injection
3. Bash tool execution (Python scripts)
4. Dune API queries and results
5. Multi-turn agent conversation
6. Token usage and costs

### Requirements

- `.env` with `ANTHROPIC_API_KEY` and `DUNE_API_KEY`
- Python 3 with `dune-client` installed

### Expected Output

The test queries Bitcoin inflows to Binance addresses and returns:
- Daily BTC inflow amounts
- Transaction counts
- Cumulative totals
- Formatted analysis

**Cost**: ~$0.20 per run
