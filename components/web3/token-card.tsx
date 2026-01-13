'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TokenData = {
  name: string
  symbol: string
  price: number
  change24h?: number
  marketCap?: number
}

interface TokenCardProps {
  token: TokenData
}

export function TokenCard({ token }: TokenCardProps) {
  const isPositive = (token.change24h ?? 0) >= 0

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    if (price < 100) return `$${price.toFixed(2)}`
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  return (
    <Card className="max-w-xs">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{token.symbol}</span>
          {token.change24h !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(token.change24h).toFixed(2)}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formatPrice(token.price)}</p>
        <p className="text-sm text-muted-foreground">{token.name}</p>
        {token.marketCap && (
          <p className="mt-2 text-xs text-muted-foreground">
            Market Cap: {formatMarketCap(token.marketCap)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
