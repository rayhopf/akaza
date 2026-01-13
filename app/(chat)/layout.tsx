import { ChatSidebar } from '@/components/chat/chat-sidebar'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex flex-1 flex-col min-h-0">{children}</main>
    </div>
  )
}
