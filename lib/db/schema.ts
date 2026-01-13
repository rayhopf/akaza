import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
})

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  title: text('title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .references(() => conversations.id)
    .notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  actions: text('actions', { mode: 'json' }).$type<ActionData[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
})

export type ActionData = {
  type: 'swap' | 'buy' | 'polymarket'
  data: Record<string, unknown>
}

export type User = typeof users.$inferSelect
export type Conversation = typeof conversations.$inferSelect
export type Message = typeof messages.$inferSelect
