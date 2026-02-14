'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type SwapQuote = {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  fromChain?: string
  toChain?: string
  rate?: string
  priceImpact?: string
}

type SwapCardProps = {
  quote: SwapQuote
}

export function SwapCard({ quote }: SwapCardProps): React.JSX.Element {
  const { isConnected } = useAccount()

  function handleSwap(): void {
    // TODO: Implement actual swap execution
    console.log('Executing swap:', quote)
  }

  return (
    <Card className="max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Swap</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Token pair display */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{quote.fromAmount}</p>
            <p className="text-sm text-muted-foreground">{quote.fromToken}</p>
            {quote.fromChain && (
              <p className="text-xs text-muted-foreground">{quote.fromChain}</p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="text-center">
            <p className="text-2xl font-bold">{quote.toAmount}</p>
            <p className="text-sm text-muted-foreground">{quote.toToken}</p>
            {quote.toChain && (
              <p className="text-xs text-muted-foreground">{quote.toChain}</p>
            )}
          </div>
        </div>

        {/* Rate info */}
        {quote.rate && (
          <p className="text-xs text-muted-foreground mb-4">
            Rate: 1 {quote.fromToken} = {quote.rate} {quote.toToken}
          </p>
        )}

        {/* Action button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button onClick={openConnectModal} className="w-full">
                Connect Wallet to Swap
              </Button>
            )}
          </ConnectButton.Custom>
        ) : (
          <Button onClick={handleSwap} className="w-full">
            Swap Now
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
