import { query } from '@anthropic-ai/claude-agent-sdk'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

async function testDuneExecution() {
  const cacheDir = path.join(process.cwd(), '.cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  const logFile = path.join(cacheDir, 'dune-test-output.log')
  const logStream = fs.createWriteStream(logFile, { flags: 'w' })

  const log = (message: string) => {
    console.log(message)
    logStream.write(message + '\n')
  }

  log('='.repeat(80))
  log('Testing Dune skill execution with Binance BTC flow query')
  log('='.repeat(80))
  log('')

  try {
    const q = query({
      prompt: 'binance btc flowin in recent 7 days',
      options: {
        settingSources: ['project', 'user'],
        allowedTools: ['Skill', 'Bash', 'Read', 'Write', 'Grep', 'Glob'],
        cwd: process.cwd(),
      },
    })

    let messageCount = 0

    for await (const message of q) {
      messageCount++
      log(`\n${'='.repeat(80)}`)
      log(`MESSAGE #${messageCount}`)
      log(`${'='.repeat(80)}`)
      log(`Type: ${message.type}`)
      log(`Role: ${message.role || 'N/A'}`)
      log(`Stop Reason: ${message.stop_reason || 'N/A'}`)
      log('')

      // Log full message structure
      log('Full Message:')
      log(JSON.stringify(message, null, 2))
      log('')

      // Parse content blocks
      if (message.content && Array.isArray(message.content)) {
        log(`Content Blocks: ${message.content.length}`)

        message.content.forEach((content, idx) => {
          log(`\n--- Content Block #${idx + 1} ---`)
          log(`Type: ${content.type}`)

          if (content.type === 'text') {
            log(`Text: ${content.text}`)
          }

          if (content.type === 'tool_use') {
            log(`Tool Name: ${content.name}`)
            log(`Tool ID: ${content.id}`)
            log(`Tool Input:`)
            log(JSON.stringify(content.input, null, 2))
          }

          if (content.type === 'tool_result') {
            log(`Tool Use ID: ${content.tool_use_id}`)
            log(`Tool Result:`)
            log(JSON.stringify(content.content, null, 2))
          }
        })
      }

      log('')
    }

    log('\n' + '='.repeat(80))
    log('TEST COMPLETED')
    log('='.repeat(80))
    log(`Total messages received: ${messageCount}`)
    log(`Log file saved to: ${logFile}`)

  } catch (error) {
    log('\n❌ TEST FAILED')
    log(`Error: ${error}`)
    log(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`)
  } finally {
    logStream.end()
    console.log(`\n📄 Full output saved to: ${logFile}`)
  }
}

testDuneExecution()
