/**
 * Bot Marketplace Filter Component
 * Provides category and capability filtering for bot discovery
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X, Filter, ChevronDown } from "lucide-react";

export interface BotFilters {
  categories: string[];
  capabilities: string[];
  priceRange: [number, number];
  rating: number;
  searchTerm: string;
}

interface BotMarketplaceFilterProps {
  onFiltersChange: (filters: BotFilters) => void;
  totalBots?: number;
  filteredBots?: number;
}

const BOT_CATEGORIES = [
  { id: "productivity", label: "Productivity", icon: "📊" },
  { id: "writing", label: "Writing & Content", icon: "✍️" },
  { id: "coding", label: "Coding & Development", icon: "💻" },
  { id: "marketing", label: "Marketing & Sales", icon: "📢" },
  { id: "education", label: "Education & Learning", icon: "🎓" },
  { id: "customer-service", label: "Customer Service", icon: "🤝" },
  { id: "analytics", label: "Analytics & Data", icon: "📈" },
  { id: "entertainment", label: "Entertainment", icon: "🎮" },
  { id: "health", label: "Health & Wellness", icon: "💪" },
  { id: "finance", label: "Finance & Accounting", icon: "💰" },
];

const BOT_CAPABILITIES = [
  { id: "chat", label: "Chat Interface", icon: "💬" },
  { id: "image-generation", label: "Image Generation", icon: "🖼️" },
  { id: "code-execution", label: "Code Execution", icon: "⚙️" },
  { id: "web-search", label: "Web Search", icon: "🔍" },
  { id: "file-processing", label: "File Processing", icon: "📁" },
  { id: "api-integration", label: "API Integration", icon: "🔗" },
  { id: "real-time", label: "Real-time Updates", icon: "⚡" },
  { id: "voice", label: "Voice Support", icon: "🎤" },
  { id: "multi-language", label: "Multi-language", icon: "🌍" },
  { id: "custom-training", label: "Custom Training", icon: "🧠" },
];

export function BotMarketplaceFilter({
  onFiltersChange,
  totalBots = 0,
  filteredBots = 0,
}: BotMarketplaceFilterProps) {
  const [filters, setFilters] = useState<BotFilters>({
    categories: [],
    capabilities: [],
    priceRange: [0, 100],
    rating: 0,
    searchTerm: "",
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreCapabilities, setShowMoreCapabilities] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];

    const newFilters: BotFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCapabilityToggle = (capabilityId: string) => {
    const newCapabilities = filters.capabilities.includes(capabilityId)
      ? filters.capabilities.filter((c) => c !== capabilityId)
      : [...filters.capabilities, capabilityId];

    const newFilters: BotFilters = { ...filters, capabilities: newCapabilities };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (searchTerm: string) => {
    const newFilters: BotFilters = { ...filters, searchTerm };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters: BotFilters = { ...filters, rating };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (min: number, max: number) => {
    const newFilters: BotFilters = { ...filters, priceRange: [min, max] as [number, number] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: BotFilters = {
      categories: [],
      capabilities: [],
      priceRange: [0, 100] as [number, number],
      rating: 0,
      searchTerm: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.capabilities.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  const displayedCategories = showMoreCategories
    ? BOT_CATEGORIES
    : BOT_CATEGORIES.slice(0, 5);

  const displayedCapabilities = showMoreCapabilities
    ? BOT_CAPABILITIES
    : BOT_CAPABILITIES.slice(0, 5);

  return (
    <Card className="bg-slate-900/50 border-purple-500/20 sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-300 hover:text-purple-200"
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
        <CardDescription className="text-purple-300">
          {filteredBots > 0
            ? `Showing ${filteredBots} of ${totalBots} bots`
            : `${totalBots} bots available`}
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Search</label>
            <Input
              placeholder="Search bots..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-slate-800 border-purple-500/30 text-white placeholder-purple-400"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-200">Categories</h3>
            <div className="space-y-2">
              {displayedCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="border-purple-500/50"
                  />
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-purple-200 group-hover:text-purple-100">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
            {BOT_CATEGORIES.length > 5 && (
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="text-xs text-purple-400 hover:text-purple-300 mt-2"
              >
                {showMoreCategories ? "Show less" : `Show ${BOT_CATEGORIES.length - 5} more`}
              </button>
            )}
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-200">Capabilities</h3>
            <div className="space-y-2">
              {displayedCapabilities.map((capability) => (
                <label
                  key={capability.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.capabilities.includes(capability.id)}
                    onCheckedChange={() => handleCapabilityToggle(capability.id)}
                    className="border-purple-500/50"
                  />
                  <span className="text-lg">{capability.icon}</span>
                  <span className="text-sm text-purple-200 group-hover:text-purple-100">
                    {capability.label}
                  </span>
                </label>
              ))}
            </div>
            {BOT_CAPABILITIES.length > 5 && (
              <button
                onClick={() => setShowMoreCapabilities(!showMoreCapabilities)}
                className="text-xs text-purple-400 hover:text-purple-300 mt-2"
              >
                {showMoreCapabilities ? "Show less" : `Show ${BOT_CAPABILITIES.length - 5} more`}
              </button>
            )}
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-200">Minimum Rating</h3>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.rating === rating}
                    onCheckedChange={() => handleRatingChange(rating)}
                    className="border-purple-500/50"
                  />
                  <span className="text-sm text-purple-200 group-hover:text-purple-100">
                    {rating === 0 ? "All ratings" : `${rating}+ stars`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-200">Price Range</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handlePriceChange(
                      parseInt(e.target.value) || 0,
                      filters.priceRange[1] || 100
                    )
                  }
                  placeholder="Min"
                  className="bg-slate-800 border-purple-500/30 text-white text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handlePriceChange(
                      filters.priceRange[0] || 0,
                      parseInt(e.target.value) || 100
                    )
                  }
                  placeholder="Max"
                  className="bg-slate-800 border-purple-500/30 text-white text-sm"
                />
              </div>
              <p className="text-xs text-purple-300">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}/month
              </p>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
