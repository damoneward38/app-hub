import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function BotStore() {
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'one-time' | 'monthly'>('monthly');

  // Fetch all bots
  const { data: bots, isLoading: botsLoading } = trpc.bots.getAll.useQuery();

  // Purchase bot mutation
  const purchaseBotMutation = trpc.bots.purchaseBot.useMutation({
    onSuccess: (data) => {
      console.log(`Successfully purchased ${data.botName}!`);
      setSelectedBot(null);
    },
    onError: (error) => {
      console.error(`Purchase failed: ${error.message}`);
    },
  });

  const handlePurchase = (botId: number) => {
    purchaseBotMutation.mutate({ botId, subscriptionType });
  };

  if (botsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Gifted Eternity AI Bots</h1>
          <p className="text-xl text-gray-300">
            Six powerful AI assistants by Damone Ward Sr. to supercharge your streaming platform
          </p>
          <p className="text-sm text-gray-400 mt-2">Artist: Damone Ward Sr. | Platform: Gifted Eternity Streaming</p>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {bots?.map((bot) => (
            <Card
              key={bot.id}
              className="bg-gray-900 border-purple-500 hover:border-purple-400 transition cursor-pointer"
              onClick={() => setSelectedBot(bot.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl">{bot.icon}</div>
                  <Badge variant="outline" className="bg-purple-600 border-purple-400">
                    Bot {bot.botNumber}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{bot.name}</CardTitle>
                <CardDescription className="text-gray-300">{bot.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Capabilities */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Capabilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {bot.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="bg-purple-800 text-purple-200">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Features:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {bot.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <span className="text-purple-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing */}
                <div className="mb-4 p-3 bg-purple-900 rounded-lg">
                  <div className="text-sm text-gray-300 mb-1">One-time: ${(bot.price / 100).toFixed(2)}</div>
                  <div className="text-lg font-bold text-purple-300">
                    Monthly: ${(bot.monthlyPrice / 100).toFixed(2)}/month
                  </div>
                </div>

                {/* Artist Info */}
                <div className="text-xs text-gray-400 mb-4">
                  <p>Created by: <span className="text-purple-300 font-semibold">{bot.artist}</span></p>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => setSelectedBot(bot.id)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  View Details & Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Modal */}
        {selectedBot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-gray-900 border-purple-500">
              <CardHeader>
                <CardTitle>Purchase Bot</CardTitle>
                <CardDescription>
                  {bots?.find(b => b.id === selectedBot)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subscription Type Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Subscription Type:</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSubscriptionType('one-time')}
                      variant={subscriptionType === 'one-time' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      One-time
                    </Button>
                    <Button
                      onClick={() => setSubscriptionType('monthly')}
                      variant={subscriptionType === 'monthly' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      Monthly
                    </Button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3 bg-purple-900 rounded-lg">
                  <div className="text-sm text-gray-300">
                    {subscriptionType === 'one-time' ? 'One-time Price' : 'Monthly Price'}
                  </div>
                  <div className="text-2xl font-bold text-purple-300">
                    ${subscriptionType === 'one-time'
                      ? (bots?.find(b => b.id === selectedBot)?.price ?? 0) / 100
                      : (bots?.find(b => b.id === selectedBot)?.monthlyPrice ?? 0) / 100
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePurchase(selectedBot)}
                    disabled={purchaseBotMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {purchaseBotMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase Now'
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedBot(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
