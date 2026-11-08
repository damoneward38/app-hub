import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Sparkles } from "lucide-react";

export default function BotStoreSimple() {
  const { data: bots } = trpc.botPurchase.getAll.useQuery();
  const purchaseMutation = trpc.botPurchase.purchase.useMutation();
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "yearly">("monthly");
  const [successMessage, setSuccessMessage] = useState("");

  const handleBuy = (botId: number) => {
    purchaseMutation.mutate(
      { botId, subscriptionType },
      {
        onSuccess: (data) => {
          setSuccessMessage(`${data.botName} purchased! Price: $${(data.price / 100).toFixed(2)}`);
          setTimeout(() => setSuccessMessage(""), 3000);
        },
      }
    );
  };

  // Separate branded and blank bots
  const brandedBots = bots?.filter(b => b.type === "branded") || [];
  const blankBots = bots?.filter(b => b.type === "blank") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Bots Store
          </h1>
          <p className="text-gray-600 text-lg">Choose between pre-configured bots or build your own</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Subscription Type Selector */}
        <div className="mb-8 flex gap-4 justify-center">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition" style={{borderColor: subscriptionType === "monthly" ? "#9333ea" : "#e5e7eb"}}>
            <input
              type="radio"
              value="monthly"
              checked={subscriptionType === "monthly"}
              onChange={() => setSubscriptionType("monthly")}
              className="w-4 h-4"
            />
            <span className="font-medium">Monthly - $29.99/mo (Branded) or $19.99/mo (Custom)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition" style={{borderColor: subscriptionType === "yearly" ? "#9333ea" : "#e5e7eb"}}>
            <input
              type="radio"
              value="yearly"
              checked={subscriptionType === "yearly"}
              onChange={() => setSubscriptionType("yearly")}
              className="w-4 h-4"
            />
            <span className="font-medium">Yearly - $299.99/yr (Branded) or $199.99/yr (Custom)</span>
          </label>
        </div>

        {/* Branded Bots Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Damone Ward Sr. Branded Bots</h2>
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Pre-configured</span>
          </div>
          <p className="text-gray-600 mb-6">Ready-to-use AI bots pre-loaded with gospel music content and expertise</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandedBots.map(bot => (
              <div key={bot.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">🤖</div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">BRANDED</span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 text-gray-900">{bot.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{bot.description}</p>

                <div className="mb-4 p-3 bg-purple-50 rounded">
                  <p className="text-2xl font-bold text-purple-600">
                    ${subscriptionType === "monthly" ? (bot.priceMonthly / 100).toFixed(2) : (bot.priceYearly / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    per {subscriptionType === "monthly" ? "month" : "year"}
                  </p>
                </div>

                <Button
                  onClick={() => handleBuy(bot.id)}
                  disabled={purchaseMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Blank Bot Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">Custom Bot Builder</h2>
            <span className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">Build Your Own</span>
          </div>
          <p className="text-gray-600 mb-6">Start with a blank slate and customize your bot with your own knowledge base, content, and expertise</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blankBots.map(bot => (
              <div key={bot.id} className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition border-l-4 border-pink-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl">✨</div>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded font-medium">NEW</span>
                </div>
                
                <h3 className="font-bold text-2xl mb-2 text-gray-900">{bot.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{bot.description}</p>

                {/* Features */}
                <ul className="mb-6 space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-pink-600">✓</span> Upload your own knowledge base
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-600">✓</span> Add websites, books, and content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-600">✓</span> Generate custom blog posts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-600">✓</span> Full customization control
                  </li>
                </ul>

                <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <p className="text-3xl font-bold text-pink-600">
                    ${subscriptionType === "monthly" ? (bot.priceMonthly / 100).toFixed(2) : (bot.priceYearly / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    per {subscriptionType === "monthly" ? "month" : "year"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">33% cheaper than branded bots</p>
                </div>

                <Button
                  onClick={() => handleBuy(bot.id)}
                  disabled={purchaseMutation.isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-bold text-purple-600">Branded Bots</th>
                  <th className="text-center py-3 px-4 font-bold text-pink-600">Custom Bot Builder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Pre-configured Content</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">—</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Ready to Use Immediately</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">—</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Upload Custom Content</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Full Customization</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Lower Price</td>
                  <td className="text-center py-3 px-4">—</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700 font-bold">Price</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">$29.99/mo</td>
                  <td className="text-center py-3 px-4 font-bold text-pink-600">$19.99/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
