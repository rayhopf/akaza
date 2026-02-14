'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatMarketCap, formatPrice } from '@/lib/utils'

export type TokenData = {
  name: string
  symbol: string
  price: number
  change24h?: number
  marketCap?: number
}

type TokenCardProps = {
  token: TokenData
}

export function TokenCard({ token }: TokenCardProps): React.JSX.Element {
  const isPositive = (token.change24h ?? 0) >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

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
              <TrendIcon className="h-4 w-4" />
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
