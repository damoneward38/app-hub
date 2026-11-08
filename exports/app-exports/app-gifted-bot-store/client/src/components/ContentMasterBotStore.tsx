import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, BookOpen, Music, Globe, Users, BarChart3, ArrowRight } from "lucide-react";

interface ContentMasterBotStoreProps {
  onPurchase?: () => void;
  isPurchased?: boolean;
}

export const ContentMasterBotStore: React.FC<ContentMasterBotStoreProps> = ({
  onPurchase,
  isPurchased = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "lifetime">("monthly");

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "All Six Bots",
      description: "BrainBot, CreativeBot, HypeBot, SyncBot, ValidatorBot, MonitorBot",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Knowledge Base",
      description: "Store unlimited information about websites, books, music, and artists",
    },
    {
      icon: <Music className="w-5 h-5" />,
      title: "Blog Generation",
      description: "Automatically generate blog posts from your knowledge base",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Content Pointer",
      description: "Intelligent search and navigation across your entire ecosystem",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Artist Management",
      description: "Track and manage all artists, their work, and collaborations",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Analytics & Stats",
      description: "Comprehensive statistics on your knowledge base and content",
    },
  ];

  const capabilities = [
    "Content Management & Analysis (BrainBot)",
    "Music Distribution & Generation (CreativeBot)",
    "Marketing Campaigns & Growth (HypeBot)",
    "Real-time Synchronization (SyncBot)",
    "Quality Assurance & Validation (ValidatorBot)",
    "System Monitoring & Alerts (MonitorBot)",
    "Custom Knowledge Base",
    "Blog Post Generation",
    "Content Search & Pointer",
    "Export/Import Knowledge",
    "Featured Blog Posts",
    "Bot Orchestration",
  ];

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12">
        <div className="relative z-10">
          <Badge className="mb-4">Premium Bot</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gifted Eternity Content Master</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
            The ultimate all-in-one bot combining six specialized AI assistants to manage your entire creative
            ecosystem. Perfect for artists, creators, and content managers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">AI-Powered</Badge>
            <Badge variant="outline">6 Bots Integrated</Badge>
            <Badge variant="outline">Knowledge Base</Badge>
            <Badge variant="outline">Blog Generator</Badge>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedPlan === "monthly" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">$29</div>
                <p className="text-sm text-muted-foreground">per month, billed monthly</p>
              </div>
              <Button className="w-full" disabled={isPurchased} onClick={onPurchase}>
                {isPurchased ? "Already Purchased" : "Subscribe Now"}
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>All six bots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Unlimited knowledge entries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Blog generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Lifetime Plan */}
          <Card
            className={`cursor-pointer transition-all relative ${
              selectedPlan === "lifetime" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedPlan("lifetime")}
          >
            <div className="absolute -top-3 right-4">
              <Badge className="bg-green-600">Best Value</Badge>
            </div>
            <CardHeader>
              <CardTitle>Lifetime</CardTitle>
              <CardDescription>One-time payment, forever access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">$299</div>
                <p className="text-sm text-muted-foreground">one-time payment</p>
              </div>
              <Button className="w-full" disabled={isPurchased} onClick={onPurchase}>
                {isPurchased ? "Already Purchased" : "Buy Lifetime"}
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>All six bots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Unlimited knowledge entries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Unlimited blog generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Future updates included</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Capabilities */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Complete Capabilities</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: 1,
              title: "Feed Information",
              description: "Add websites, books, music, artists, and features to your knowledge base",
            },
            {
              step: 2,
              title: "Six Bots Analyze",
              description: "All six bots work together to understand and organize your content",
            },
            {
              step: 3,
              title: "Generate Content",
              description: "Automatically create blog posts and content recommendations",
            },
            {
              step: 4,
              title: "Point & Navigate",
              description: "Use intelligent search to navigate your entire ecosystem",
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary text-primary-foreground">{item.step}</Badge>
                    {index < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I use the Content Master without the six bots?",
              a: "No, the Content Master is specifically designed to leverage all six bots working together. The bots provide the intelligence and automation that makes the knowledge base powerful.",
            },
            {
              q: "How much data can I store?",
              a: "With the Content Master, you get unlimited knowledge entries. Store as much information as you need about your websites, books, music, and artists.",
            },
            {
              q: "Can I export my data?",
              a: "Yes! You can export your entire knowledge base as JSON at any time. This makes it easy to backup or migrate your data.",
            },
            {
              q: "Is there a free trial?",
              a: "We offer a limited free tier with basic features. Upgrade to monthly or lifetime for full access to all six bots and unlimited content generation.",
            },
            {
              q: "What if I need help?",
              a: "All plans include priority support. Our team is here to help you get the most out of your Content Master.",
            },
          ].map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Master Your Content?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join creators and artists using the Gifted Eternity Content Master to organize, generate, and manage their
          entire creative ecosystem.
        </p>
        <Button size="lg" onClick={onPurchase} disabled={isPurchased}>
          {isPurchased ? "Already Purchased" : `Get Started - $${selectedPlan === "monthly" ? "29" : "299"}`}
        </Button>
      </div>
    </div>
  );
};

export default ContentMasterBotStore;
